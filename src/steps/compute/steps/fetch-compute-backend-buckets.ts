import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_BACKEND_BUCKETS,
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  ENTITY_CLASS_COMPUTE_BACKEND_BUCKET,
  ComputePermissions,
} from '../constants';
import { createBackendBucketEntity } from '../converters';

export async function fetchComputeBackendBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateBackendBuckets(async (backendBucket) => {
    const backendBucketEntity = createBackendBucketEntity(backendBucket);
    await jobState.addEntity(backendBucketEntity);
  });
}

export const fetchBackendBucketsStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_BACKEND_BUCKETS,
  ingestionSourceId: IngestionSources.COMPUTE_BACKEND_BUCKETS,
  name: 'Compute Backend Buckets',
  entities: [
    {
      resourceName: 'Compute Backend Bucket',
      _type: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
      _class: ENTITY_CLASS_COMPUTE_BACKEND_BUCKET,
    },
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchComputeBackendBuckets,
  permissions: ComputePermissions.STEP_COMPUTE_BACKEND_BUCKETS,
  apis: ['compute.googleapis.com'],
};
