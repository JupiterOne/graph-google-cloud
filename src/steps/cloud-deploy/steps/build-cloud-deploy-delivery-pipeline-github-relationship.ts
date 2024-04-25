import {
  RelationshipClass,
  RelationshipDirection,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  IngestionSources,
  MAPPED_RELATIONSHIP_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP,
} from '../constant';

export async function buildCloudDeployDeliveryPipelineGithubRepoRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE },
    async (deliveryPipeline) => {
      await jobState.addRelationship(
        createMappedRelationship({
          _class: RelationshipClass.USES,
          _type:
            MAPPED_RELATIONSHIP_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO,
          _mapping: {
            relationshipDirection: RelationshipDirection.FORWARD,
            sourceEntityKey: deliveryPipeline._key,
            targetFilterKeys: [['_type']],
            skipTargetCreation: true,
            targetEntity: {
              _type: 'github_repo',
            },
          },
        }),
      );
    },
  );
}

export const buildCloudDeployPipelinesUsesGithubRepositoryStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP,
    name: 'Cloud Deploy Delivery Pipeline Uses Github Repo Relationship',
    ingestionSourceId:
      IngestionSources.CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELATIONSHIP,
    entities: [],
    dependsOn: [STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE],
    relationships: [],
    mappedRelationships: [
      {
        _type:
          MAPPED_RELATIONSHIP_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO,
        sourceType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        _class: RelationshipClass.USES,
        targetType: 'github_repo',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    executionHandler: buildCloudDeployDeliveryPipelineGithubRepoRelationship,
  };
