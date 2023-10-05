import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildTriggerEntity } from '../converters';

export const fetchCloudBuildTriggerStep: GoogleCloudIntegrationStep = {
  ...CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS,
  entities: [CloudBuildEntitiesSpec.BUILD_TRIGGER],
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

    await client.iterateBuildTriggers(async (data) => {
      await jobState.addEntity(createGoogleCloudBuildTriggerEntity(data));
    });
  },
  permissions: ['cloudbuild.builds.list'],
  apis: ['cloudbuild.googleapis.com'],
};
