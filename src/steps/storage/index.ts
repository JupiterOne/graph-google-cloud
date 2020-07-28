import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { CloudStorageClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createCloudStorageBucketEntity } from './converters';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
} from './constants';

export * from './constants';

export async function fetchStorageBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new CloudStorageClient({ config });
  await client.iterateCloudStorageBuckets(
    async (bucket) =>
      await jobState.addEntity(
        createCloudStorageBucketEntity(bucket, config.projectId),
      ),
  );
}

export const storageSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_CLOUD_STORAGE_BUCKETS,
    name: 'Cloud Storage Buckets',
    types: [CLOUD_STORAGE_BUCKET_ENTITY_TYPE],
    executionHandler: fetchStorageBuckets,
  },
];
