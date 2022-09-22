import {
  createMappedRelationship,
  Entity,
  getRawData,
  IntegrationStep,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';

export const buildCloudBuildTriggerUsesGithubRepositoryStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS,
    entities: [],
    dependsOn: [
      CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS.id,
      CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG.id,
    ],
    relationships: [],
    mappedRelationships: [
      {
        _type: 'google_cloud_build_trigger_uses_github_repo',
        sourceType: CloudBuildEntitiesSpec.BUILD_TRIGGER._type,
        _class: RelationshipClass.USES,
        targetType: 'github_repo',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    executionHandler: async function (context: IntegrationStepContext) {
      const { jobState } = context;

      const gheConfigEntityCache: {
        [enterpriseConfigResourceName: string]: Entity | null;
      } = {};

      await jobState.iterateEntities(
        {
          _type: CloudBuildEntitiesSpec.BUILD_GITHUB_ENTERPRISE_CONFIG._type,
        },
        (gheConfigEntity) => {
          gheConfigEntityCache[gheConfigEntity._key] = gheConfigEntity;
        },
      );

      await jobState.iterateEntities(
        { _type: CloudBuildEntitiesSpec.BUILD_TRIGGER._type },
        async (buildTriggerEntity) => {
          const rawBuild =
            getRawData<cloudbuild_v1.Schema$BuildTrigger>(buildTriggerEntity);

          if (
            rawBuild?.github &&
            rawBuild?.github.enterpriseConfigResourceName
          ) {
            const gheConfigEntity =
              gheConfigEntityCache[
                rawBuild.github.enterpriseConfigResourceName!
              ];
            if (!gheConfigEntity) return;

            await jobState.addRelationship(
              createMappedRelationship({
                _class: RelationshipClass.USES,
                _type: 'google_cloud_build_trigger_uses_github_repo',
                _mapping: {
                  relationshipDirection: RelationshipDirection.FORWARD,
                  sourceEntityKey: buildTriggerEntity._key,
                  targetFilterKeys: [['_type', 'webLink']],
                  skipTargetCreation: true,
                  targetEntity: {
                    _type: 'github_repo',
                    webLink: `${gheConfigEntity.hostUrl}/${rawBuild.github.owner}/${rawBuild.github.name}`,
                  },
                },
              }),
            );
          }
        },
      );
    },
  };
