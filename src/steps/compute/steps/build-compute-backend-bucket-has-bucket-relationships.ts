import {
  RelationshipClass,
  createDirectRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
  RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET,
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  STEP_COMPUTE_BACKEND_BUCKETS,
} from '../constants';
import { compute_v1 } from 'googleapis';
import { StorageEntitiesSpec, StorageStepsSpec } from '../../storage/constants';
import { getCloudStorageBucketKey } from '../../storage/converters';

export async function buildComputeBackendBucketHasBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET },
    async (backendBucketEntity) => {
      const instance =
        getRawData<compute_v1.Schema$BackendBucket>(backendBucketEntity);
      if (!instance) {
        logger.warn(
          {
            _key: backendBucketEntity._key,
          },
          'Could not find raw data on backend bucket instance entity',
        );
        return;
      }

      const bucketName = instance.bucketName;
      if (!bucketName) {
        return;
      }

      const bucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(bucketName),
      );
      if (!bucketEntity) {
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: backendBucketEntity,
          to: bucketEntity,
        }),
      );
    },
  );
}

export const buildComputeBackendBucketHasBucketRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
    name: 'Build Compute Backend Bucket Bucket Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
        targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_BACKEND_BUCKETS,
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    ],
    executionHandler: buildComputeBackendBucketHasBucketRelationships,
  };
