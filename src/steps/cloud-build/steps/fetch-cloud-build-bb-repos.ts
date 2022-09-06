import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudBuildClient } from '../client';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';
import { createGoogleCloudBuildBitbucketRepoEntity } from '../converters';

import { getRawData } from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';

export const fetchCloudBuildBitbucketRepositoriesStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS,
    executionHandler: async function (
      context: IntegrationStepContext,
    ): Promise<void> {
      const {
        jobState,
        instance: { config },
      } = context;
      const client = new CloudBuildClient({ config });

      await jobState.iterateEntities(
        { _type: CloudBuildEntitiesSpec.BUILD_BITBUCKET_SERVER_CONFIG._type },
        async (serverConfigEntity) => {
          const serverConfig =
            getRawData<cloudbuild_v1.Schema$BitbucketServerConfig>(
              serverConfigEntity,
            );

          await client.iterateBuildBitbucketRepositories(
            serverConfig!,
            async (repository) => {
              const repositoryEntity =
                createGoogleCloudBuildBitbucketRepoEntity(repository);
              await jobState.addEntity(repositoryEntity);

              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.HAS,
                  from: serverConfigEntity,
                  to: repositoryEntity,
                }),
              );
            },
          );
        },
      );
    },
  };
