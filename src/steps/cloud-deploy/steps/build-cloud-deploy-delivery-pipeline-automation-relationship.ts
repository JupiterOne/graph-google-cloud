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
  ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
  ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  RELATIONSHIP_TYPE_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE,
  STEP_CLOUD_DEPLOY_AUTOMATION,
  STEP_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
} from '../constant';
import { IngestionSources } from '../constant';
import { getKey } from '../converter';

export async function buildCloudAutomationDeployDeliveryPipelineRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION },
    async (automation) => {
      const deliveryPipelineKey = getKey(
        ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        automation.deliveryPipelineUid as string,
      );

      if (!jobState.hasKey(deliveryPipelineKey)) {
        throw new IntegrationMissingKeyError(`
        Step Name: Build Cloud Deploy Automation Delivery Pipeline Relationship
        Entity Name: Cloud Deploy Delivery Pipeline,
        Key: ${deliveryPipelineKey} 
        `);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.TRIGGERS,
          fromKey: automation._key,
          fromType: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
          toKey: deliveryPipelineKey as string,
          toType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        }),
      );
    },
  );
}

export const buildCloudDeployAutomationDeliveryPipelineRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE_AUTOMATION_RELATIONSHIP,
    name: 'Build Cloud Deploy Automation Delivery Pipeline Relationship',
    entities: [],
    relationships: [
      {
        _type:
          RELATIONSHIP_TYPE_CLOUD_DEPLOY_AUTOMATION_TRIGGERS_DELIVERY_PIPELINE,
        sourceType: ENTITY_TYPE_CLOUD_DEPLOY_AUTOMATION,
        _class: RelationshipClass.TRIGGERS,
        targetType: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
      },
    ],
    dependsOn: [
      STEP_CLOUD_DEPLOY_AUTOMATION,
      STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
    ],
    executionHandler: buildCloudAutomationDeployDeliveryPipelineRelationship,
  };
