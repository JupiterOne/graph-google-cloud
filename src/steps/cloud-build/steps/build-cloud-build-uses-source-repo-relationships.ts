import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudSourceRepositoriesStepsSpec } from '../../cloud-source-repositories/constants';
import {
  CloudBuildEntitiesSpec,
  CloudBuildRelationshipsSpec,
  CloudBuildStepsSpec,
} from '../constants';

export const buildCloudBuildUsesSourceRepositoryRelationshipsStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS,
    entities: [],
    relationships: [CloudBuildRelationshipsSpec.BUILD_USES_SOURCE_REPOSITORY],
    dependsOn: [
      CloudBuildStepsSpec.FETCH_BUILDS.id,
      CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id,
    ],
    executionHandler: async function (context: IntegrationStepContext) {
      const { jobState } = context;

      await jobState.iterateEntities(
        { _type: CloudBuildEntitiesSpec.BUILD._type },
        async (buildEntity) => {
          const rawBuild = getRawData<cloudbuild_v1.Schema$Build>(buildEntity);

          if (rawBuild?.source?.repoSource) {
            const sourceEntity = await jobState.findEntity(
              `projects/${rawBuild.source.repoSource.projectId}/repos/${rawBuild.source.repoSource.repoName}`,
            );

            if (sourceEntity) {
              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.USES,
                  from: buildEntity,
                  to: sourceEntity,
                }),
              );
            }
          }
        },
      );
    },
  };
