import {
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
  Relationships,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  STEP_CLOUD_DEPLOY_SERVICE,
  STEP_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP,
} from '../constant';
import { getKey } from '../converter';

export async function buildCloudDeployServiceDeliveryPipelineRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState, logger} = context;

  const cloudDeployServiceKey = getKey(
    ENTITY_TYPE_CLOUD_DEPLOY_SERVICE,
    instance.id,
  );

  if (!jobState.hasKey(cloudDeployServiceKey)) {
    logger.warn(`
    Step Name: Build Cloud Deploy Service Has Delivery Pipeline Relationship
    Entity Name: Cloud Deploy Service,
    Key: ${cloudDeployServiceKey} 
    `);
  }else{
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
}

export const builCloudDeployServiceDeliveryPipelineRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE_RELAIONSHIP,
    name: 'Build Cloud Deploy Service Delivery Pipeline Relationship',
    entities: [],
    relationships: [
      Relationships.CLOUD_DEPLOY_SERVICE_HAS_DELIVERY_PIPELINE
    ],
    dependsOn: [STEP_CLOUD_DEPLOY_SERVICE, STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE],
    executionHandler: buildCloudDeployServiceDeliveryPipelineRelationship,
  };
