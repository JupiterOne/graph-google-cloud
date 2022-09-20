import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudSourceRepositoriesClient } from '../client';
import {
  CloudSourceRepositoriesEntitiesSpec,
  CloudSourceRepositoriesStepsSpec,
} from '../constants';
import { createRepositoryEntity } from '../converters';

export const fetchCloudSourceRepositoriesStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES,
    entities: [CloudSourceRepositoriesEntitiesSpec.REPOSITORY],
    relationships: [],
    executionHandler: async function (
      context: IntegrationStepContext,
    ): Promise<void> {
      const {
        jobState,
        instance: { config },
      } = context;
      const client = new CloudSourceRepositoriesClient({ config });

      await client.iterateRepositories(async (data) => {
        await jobState.addEntity(createRepositoryEntity(data));
      });
    },
  };
