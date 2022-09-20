import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildEntity } from '../converters';

export const fetchCloudBuildStep: IntegrationStep<IntegrationConfig> = {
  ...CloudBuildStepsSpec.FETCH_BUILDS,
  entities: [CloudBuildEntitiesSpec.BUILD],
  relationships: [],
  executionHandler: async function (
    context: IntegrationStepContext,
  ): Promise<void> {
    const {
      jobState,
      instance: { config },
    } = context;
    const client = new CloudBuildClient({ config });

    await client.iterateBuilds(async (data) => {
      await jobState.addEntity(createGoogleCloudBuildEntity(data));
    });
  },
};
