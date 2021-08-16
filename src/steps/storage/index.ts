import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { CloudStorageClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  createCloudStorageBucketEntity,
  getCloudStorageBucketKey,
} from './converters';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
  CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
  STEP_CLOUD_STORAGE_BUCKETS_WITH_ACCESS_LEVELS,
} from './constants';
import { storage_v1 } from 'googleapis';
import { isMemberPublic } from '../../utils/iam';
import { publishUnprocessedBucketsEvent } from '../../utils/events';
import { STEP_CACHE_IF_RESOURCES_ARE_PUBLIC } from '../cloud-asset/constants';
import { getIfResourceIsPublic } from '../../utils/jobState';

export * from './constants';

function isBucketPolicyPublicAccess(
  bucketPolicy?: storage_v1.Schema$Policy,
): boolean {
  if (bucketPolicy) {
    for (const binding of bucketPolicy.bindings || []) {
      for (const member of binding.members || []) {
        if (isMemberPublic(member)) {
          return true;
        }
      }
    }
  }

  return false;
}

export async function fetchStorageBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudStorageClient({ config });

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

    await jobState.addEntity(
      createCloudStorageBucketEntity({
        data: bucket,
        projectId: config.serviceAccountKeyConfig.project_id,
        accessLevel: isBucketPolicyPublicAccess(bucketPolicy)
          ? 'public'
          : 'private',
      }),
    );
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

export async function fetchStorageBucketsWithAccessLevel(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new CloudStorageClient({ config });

  await client.iterateCloudStorageBuckets(async (bucket) => {
    const bucketId = bucket.id as string;
    const bucketKey = getCloudStorageBucketKey(bucketId);

    const { accessLevel, condition } =
      (await getIfResourceIsPublic(
        jobState,
        CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
        bucketKey,
      )) ?? {};
    await jobState.addEntity(
      createCloudStorageBucketEntity({
        data: bucket,
        projectId: config.serviceAccountKeyConfig.project_id,
        accessLevel,
        condition,
      }),
    );
  });
}

/**
 * Both STEP_CLOUD_STORAGE_BUCKETS and STEP_CLOUD_STORAGE_BUCKETS_WITH_ACCESS_LEVELS
 * ingest the same data, except STEP_CLOUD_STORAGE_BUCKETS_WITH_ACCESS_LEVELS has
 * access to more accurate, organization level data for determining the exact
 * permissions attached to a storage bucket. We do not ever want to run both of
 * these steps in a single integration run.
 *
 * When the data is available, we always want to run
 * STEP_CLOUD_STORAGE_BUCKETS_WITH_ACCESS_LEVELS. That data's availability depends
 * on the integration configuration and what apis the organization has granted
 * access to use. `getStepStartStates` is used to to determine which step is run.
 */
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
    executionHandler: fetchStorageBuckets,
  },
  {
    id: STEP_CLOUD_STORAGE_BUCKETS_WITH_ACCESS_LEVELS,
    name: 'Cloud Storage Buckets with Access Levels',
    entities: [
      {
        resourceName: 'Cloud Storage Bucket',
        _type: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
        _class: CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_CACHE_IF_RESOURCES_ARE_PUBLIC],
    executionHandler: fetchStorageBucketsWithAccessLevel,
  },
];
