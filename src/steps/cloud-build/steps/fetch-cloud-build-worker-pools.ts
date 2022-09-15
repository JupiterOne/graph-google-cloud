import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildWorkerPoolEntity } from '../converters';

export const fetchCloudBuildWorkerPoolsStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS,
    executionHandler: async function (
      context: IntegrationStepContext,
    ): Promise<void> {
      const {
        jobState,
        instance: { config },
      } = context;
      const client = new CloudBuildClient({ config });

      await client.iterateBuildWorkerPools(async (data) => {
        await jobState.addEntity(createGoogleCloudBuildWorkerPoolEntity(data));
      });
    },
  };
