import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildBitbucketServerConfigEntity } from '../converters';

export const fetchCloudBuildBitbucketServerConfigStep: GoogleCloudIntegrationStep =
  {
    ...CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG,
    entities: [CloudBuildEntitiesSpec.BUILD_BITBUCKET_SERVER_CONFIG],
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

      await client.iterateBuildsBitbucketServerConfigs(async (data) => {
        await jobState.addEntity(
          createGoogleCloudBuildBitbucketServerConfigEntity(data),
        );
      });
    },
    permissions: [
      'cloudbuild.integrations.list',
      'cloudbuild.integrations.get',
    ],
    apis: ['cloudbuild.googleapis.com'],
  };
