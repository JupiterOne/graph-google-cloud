import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildBitbucketServerConfigEntity } from '../converters';

export const fetchCloudBuildBitbucketServerConfigStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG,
    executionHandler: async function (
      context: IntegrationStepContext,
    ): Promise<void> {
      const {
        jobState,
        instance: { config },
      } = context;
      const client = new CloudBuildClient({ config });

      await client.iterateBuildsBitbucketServerConfigs(async (data) => {
        await jobState.addEntity(
          createGoogleCloudBuildBitbucketServerConfigEntity(data),
        );
      });
    },
  };
