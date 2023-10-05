import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildGithubEnterpriseConfigEntity } from '../converters';

export const fetchCloudBuildGithubEnterpriseConfigStep: GoogleCloudIntegrationStep =
  {
    ...CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG,
    entities: [CloudBuildEntitiesSpec.BUILD_GITHUB_ENTERPRISE_CONFIG],
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

      await client.iterateBuildsGheConfigs(async (data) => {
        await jobState.addEntity(
          createGoogleCloudBuildGithubEnterpriseConfigEntity(data),
        );
      }, context);
    },
    permissions: ['cloudbuild.integrations.list'],
    apis: ['cloudbuild.googleapis.com'],
  };
