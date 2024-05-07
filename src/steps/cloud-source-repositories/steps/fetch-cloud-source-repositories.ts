import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudSourceRepositoriesClient } from '../client';
import {
  CloudSourcePermissions,
  CloudSourceRepositoriesEntitiesSpec,
  CloudSourceRepositoriesStepsSpec,
  IngestionSources,
} from '../constants';
import { createRepositoryEntity } from '../converters';

export const fetchCloudSourceRepositoriesStep: GoogleCloudIntegrationStep = {
  ...CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES,
  ingestionSourceId: IngestionSources.CLOUD_SOURCE_REPOSITORIES,
  entities: [CloudSourceRepositoriesEntitiesSpec.REPOSITORY],
  relationships: [],
  executionHandler: async function (
    context: IntegrationStepContext,
  ): Promise<void> {
    const {
      jobState,
      instance: { config },
      logger,
    } = context;
    const client = new CloudSourceRepositoriesClient({ config }, logger);

    await client.iterateRepositories(async (data) => {
      await jobState.addEntity(createRepositoryEntity(data));
    });
  },
  permissions: CloudSourcePermissions.FETCH_REPOSITORIES,
  apis: ['source.googleapis.com'],
};
