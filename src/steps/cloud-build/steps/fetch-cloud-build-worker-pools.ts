import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildWorkerPoolEntity } from '../converters';

export const fetchCloudBuildWorkerPoolsStep: GoogleCloudIntegrationStep = {
  ...CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS,
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
  permissions: ['cloudbuild.workerpools.list'],
  apis: ['cloudbuild.googleapis.com'],
};
