import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
  ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  Relationships,
  STEP_CLOUD_DEPLOY_AUTOMATION,
  STEP_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
} from '../constant';
import { getKey } from '../converter';

export async function buildCloudAutomationDeployDeliveryPipelineRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION },
    async (automation) => {
      const deliveryPipelineKey = getKey(
        ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        automation.deliveryPipelineUid as string,
      );

      if (!jobState.hasKey(deliveryPipelineKey)) {
        logger.warn(`
        Step Name: Build Cloud Deploy Automation Delivery Pipeline Relationship
        Entity Name: Cloud Deploy Delivery Pipeline,
        Key: ${deliveryPipelineKey} 
        `);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.TRIGGERS,
            fromKey: automation._key,
            fromType: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
            toKey: deliveryPipelineKey as string,
            toType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
          }),
        );
      }
    },
  );
}

export const buildCloudDeployAutomationDeliveryPipelineRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP,
    name: 'Build Cloud Deploy Automation Delivery Pipeline Relationship',
    entities: [],
    relationships: [
      Relationships.CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE,
    ],
    dependsOn: [
      STEP_CLOUD_DEPLOY_AUTOMATION,
      STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
    ],
    executionHandler: buildCloudAutomationDeployDeliveryPipelineRelationship,
  };
