import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudBuildClient } from '../client';
import {
  CloudBuildEntitiesSpec,
  CloudBuildRelationshipsSpec,
  CloudBuildStepsSpec,
} from '../constants';
import { createGoogleCloudBuildBitbucketRepoEntity } from '../converters';

import { getRawData } from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';

export const fetchCloudBuildBitbucketRepositoriesStep: GoogleCloudIntegrationStep =
  {
    ...CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS,
    entities: [CloudBuildEntitiesSpec.BUILD_BITBUCKET_REPO],
    dependsOn: [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG.id],
    relationships: [CloudBuildRelationshipsSpec.BITBUCKET_SERVER_HAS_REPO],
    executionHandler: async function (
      context: IntegrationStepContext,
    ): Promise<void> {
      const {
        jobState,
        instance: { config },
        logger,
      } = context;
      const client = new CloudBuildClient({ config }, logger);

      await jobState.iterateEntities(
        { _type: CloudBuildEntitiesSpec.BUILD_BITBUCKET_SERVER_CONFIG._type },
        async (serverConfigEntity) => {
          const serverConfig =
            getRawData<cloudbuild_v1.Schema$BitbucketServerConfig>(
              serverConfigEntity,
            );

          await client.iterateBuildBitbucketRepositories(
            serverConfig!,
            context,
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
    permissions: [
      'cloudbuild.repositories.list',
      'cloudbuild.repositories.get',
    ],
    apis: ['cloudbuild.googleapis.com'],
  };
