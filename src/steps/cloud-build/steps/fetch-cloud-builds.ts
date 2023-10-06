import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildEntity } from '../converters';

export const fetchCloudBuildStep: GoogleCloudIntegrationStep = {
  ...CloudBuildStepsSpec.FETCH_BUILDS,
  entities: [CloudBuildEntitiesSpec.BUILD],
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

    await client.iterateBuilds(async (data) => {
      await jobState.addEntity(createGoogleCloudBuildEntity(data));
    });
  },
  permissions: ['cloudbuild.builds.list', 'cloudbuild.builds.get'],
  apis: ['cloudbuild.googleapis.com'],
};
