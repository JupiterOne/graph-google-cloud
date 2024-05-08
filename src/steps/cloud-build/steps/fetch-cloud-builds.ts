import { CloudBuildPermissions, IngestionSources } from '../constants';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildEntity } from '../converters';

export const fetchCloudBuildStep: GoogleCloudIntegrationStep = {
  ...CloudBuildStepsSpec.FETCH_BUILDS,
  ingestionSourceId: IngestionSources.CLOUD_BUILD_BUILDS,
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
  permissions: CloudBuildPermissions.FETCH_BUILDS,
  apis: ['cloudbuild.googleapis.com'],
};
