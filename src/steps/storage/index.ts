import {
  createDirectRelationship,
  Entity,
  generateRelationshipType,
  getRawData,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { CloudStorageClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createCloudStorageBucketEntity } from './converters';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
  CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
  CREATE_PROJECT_BUCKET_RELATIONSHIPS,
} from './constants';
import { storage_v1 } from 'googleapis';
import { isMemberPublic } from '../../utils/iam';
import { publishUnprocessedBucketsEvent } from '../../utils/events';
import { PROJECT_ENTITY_TYPE } from '../resource-manager';

export * from './constants';

function isBucketPolicyPublicAccess(
  bucketPolicy: storage_v1.Schema$Policy,
): boolean {
  for (const binding of bucketPolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
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
        isPublic: bucketPolicy && isBucketPolicyPublicAccess(bucketPolicy),
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

export async function createProjectStorageBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  await jobState.iterateEntities(
    { _type: CLOUD_STORAGE_BUCKET_ENTITY_TYPE },
    async (bucketEntity: Entity) => {
      const projectNumber =
        getRawData<storage_v1.Schema$Bucket>(bucketEntity)?.projectNumber;
      if (typeof projectNumber !== 'string') {
        logger.warn(
          { bucketEntityKey: bucketEntity._key },
          'Bucket does not have a projectNumber',
        );
        return;
      }
      const projectEntity = await jobState.findEntity(
        'projects/' + projectNumber,
      );
      if (!projectEntity) {
        logger.warn(
          { projectNumber },
          'Unable to find project entity in jobState',
        );
        return;
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: projectEntity,
          to: bucketEntity,
        }),
      );
    },
  );
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
    executionHandler: fetchStorageBuckets,
  },
  {
    id: CREATE_PROJECT_BUCKET_RELATIONSHIPS,
    name: 'Create Project Storage Bucket Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: generateRelationshipType(
          RelationshipClass.HAS,
          PROJECT_ENTITY_TYPE,
          CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
        ),
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      },
    ],
    dependsOn: [],
    executionHandler: createProjectStorageBucketRelationships,
    dependencyGraphId: 'last', // Needs to be last in order to ensure there are projects in the jobState
  },
];
