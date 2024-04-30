import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
  RELATIONSHIP_TYPE_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  STEP_CLOUD_DEPLOY_SERVICE,
  STEP_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP,
} from '../constant';
import { IngestionSources } from '../constant';
import { getKey } from '../converter';

export async function buildCloudDeployServiceDeliveryPipelineRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = context;

  const cloudDeployServiceKey = getKey(
    ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
    instance.id,
  );

  if (!jobState.hasKey(cloudDeployServiceKey)) {
    throw new IntegrationMissingKeyError(`
    Step Name: Build Cloud Deploy Service Has Delivery Pipeline Relationship
    Entity Name: Cloud Deploy Service,
    Key: ${cloudDeployServiceKey} 
    `);
  }
  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE },
    async (deliveryPipeline) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: cloudDeployServiceKey,
          fromType: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
          toKey: deliveryPipeline._key as string,
          toType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        }),
      );
    },
  );
}

export const builCloudDeployServiceDeliveryPipelineRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP,
    ingestionSourceId:
      IngestionSources.CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP,
    name: 'Build Cloud Deploy Service Delivery Pipeline Relationship',
    entities: [],
    relationships: [
      {
        _type: RELATIONSHIP_TYPE_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE,
        sourceType: ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
        _class: RelationshipClass.HAS,
        targetType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
      },
    ],
    dependsOn: [STEP_CLOUD_DEPLOY_SERVICE, STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE],
    executionHandler: buildCloudDeployServiceDeliveryPipelineRelationship,
  };
