import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';

export const buildCloudBuildTriggerTriggersBuildRelationshipsStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS,
    executionHandler: async function (context: IntegrationStepContext) {
      const { jobState } = context;

      await jobState.iterateEntities(
        { _type: CloudBuildEntitiesSpec.BUILD._type },
        async (buildEntity) => {
          const rawBuild = getRawData<cloudbuild_v1.Schema$Build>(buildEntity);
          const triggerEntity = await jobState.findEntity(
            rawBuild!.buildTriggerId!,
          );

          if (triggerEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.TRIGGERS,
                from: triggerEntity,
                to: buildEntity,
              }),
            );
          }
        },
      );
    },
  };
