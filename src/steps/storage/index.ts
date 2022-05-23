import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { CloudStorageClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createCloudStorageBucketEntity } from './converters';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
  CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
} from './constants';
import { storage_v1 } from 'googleapis';
import { publishUnprocessedBucketsEvent } from '../../utils/events';
import { OrgPolicyClient } from '../orgpolicy/client';

export * from './constants';

export async function fetchStorageBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudStorageClient({ config });
  const orgPolicyClient = new OrgPolicyClient({ config });

  let publicAccessPreventionPolicy: boolean | undefined = undefined;

  try {
    publicAccessPreventionPolicy =
      await orgPolicyClient.fetchOrganizationPublicAccessPreventionPolicy();
  } catch (err) {
    logger.publishEvent({
      name: 'missing_permission',
      description:
        '"orgpolicy.policy.get" is not a required permission to run the Google Cloud integration, but is required for getting organization policy for "storage.publicAccessPrevention"',
    });
  }

  const bucketIdsWithUnprocessedPolicies: string[] = [];
  await client.iterateCloudStorageBuckets(async (bucket) => {
    const bucketId = bucket.id as string;

    let bucketPolicy: storage_v1.Schema$Policy | undefined;
    try {
      bucketPolicy = await client.getPolicy(bucketId);
    } catch (err) {
      if (
        err.message ===
        'Bucket is requester pays bucket but no user project provided.'
      ) {
        bucketIdsWithUnprocessedPolicies.push(bucketId);
      } else {
        throw err;
      }
    }

    const bucketEntity = createCloudStorageBucketEntity({
      data: bucket,
      projectId: config.serviceAccountKeyConfig.project_id,
      bucketPolicy,
      publicAccessPreventionPolicy,
    });

    await jobState.addEntity(bucketEntity);
  });

  // NOTE: Being unable to process "requestor pays" buckets is a non-fatal error,
  // and should _not_ cause dependent steps from running.
  //
  // See here for more info: https://cloud.google.com/storage/docs/requester-pays
  if (bucketIdsWithUnprocessedPolicies.length) {
    logger.info(
      {
        numUnprocessedBucketPolicies: bucketIdsWithUnprocessedPolicies.length,
      },
      'Unprocessed bucket policies due to being configured with "requestor pays"',
    );

    publishUnprocessedBucketsEvent({
      logger,
      bucketIdsWithUnprocessedPolicies,
    });
  }
}

export const storageSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_CLOUD_STORAGE_BUCKETS,
    name: 'Cloud Storage Buckets',
    entities: [
      {
        resourceName: 'Cloud Storage Bucket',
        _type: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
        _class: CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchStorageBuckets,
  },
];
