import { CloudBuildPermissions, IngestionSources } from '../constants';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildWorkerPoolEntity } from '../converters';

export const fetchCloudBuildWorkerPoolsStep: GoogleCloudIntegrationStep = {
  ...CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS,
  ingestionSourceId: IngestionSources.CLOUD_BUILD_WORKER_POOLS,
  entities: [CloudBuildEntitiesSpec.BUILD_WORKER_POOL],
  relationships: [],
  executionHandler: async function (
    context: IntegrationStepContext,
  ): Promise<void> {
    const {
      jobState,
      instance: { config },
      logger,
    } = context;
    const client = new CloudBuildClient({ config }, logger);

    await client.iterateBuildWorkerPools(async (data) => {
      await jobState.addEntity(createGoogleCloudBuildWorkerPoolEntity(data));
    });
  },
  permissions: CloudBuildPermissions.FETCH_BUILD_WORKER_POOLS,
  apis: ['cloudbuild.googleapis.com'],
};
