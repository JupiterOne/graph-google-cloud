import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../../types';
import { CloudBuildEntitiesSpec, CloudBuildStepsSpec } from '../constants';

export const buildCloudBuildUsesStorageBucketRelationshipsStep: IntegrationStep<IntegrationConfig> =
  {
    ...CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS,
    executionHandler: async function (context: IntegrationStepContext) {
      const { jobState } = context;

      await jobState.iterateEntities(
        { _type: CloudBuildEntitiesSpec.BUILD._type },
        async (buildEntity) => {
          const rawBuild = getRawData<cloudbuild_v1.Schema$Build>(buildEntity);

          if (rawBuild?.source?.storageSource) {
            const storageEntity = await jobState.findEntity(
              `bucket:${rawBuild.source.storageSource.bucket}`,
            );

            if (storageEntity) {
              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.USES,
                  from: buildEntity,
                  to: storageEntity,
                }),
              );
            }
          }
        },
      );
    },
  };
