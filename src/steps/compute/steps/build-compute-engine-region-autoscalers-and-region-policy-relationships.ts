import {
  createDirectRelationship,
  IntegrationMissingKeyError,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS_AND_REGION_POLICY_RELATIONSHIPS,
  RELATIONSHIP_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALERS_HAS_REGION_POLICY,
  STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS,
  ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
  ENTITY_TYPE_AUTOSCALER_REGION_POLICY,
  STEP_AUTOSCALER_REGION_POLICY,
} from '../constants';

export async function buildComputeEngineRegionAutoscalerRegionPolicyRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_AUTOSCALER_REGION_POLICY },
    async (autoscalerRegionPolicyEntity) => {
      if (autoscalerRegionPolicyEntity && autoscalerRegionPolicyEntity._key) {
        const keyPrefix = 'regionAutoscalerPolicyId_';
        const autoscalerId = autoscalerRegionPolicyEntity._key.replace(
          keyPrefix,
          '',
        );
        const computeEngineRegionAutoscalerKey = autoscalerId;
        const hasComputeEngineAutoscalerKey = jobState.hasKey(
          computeEngineRegionAutoscalerKey,
        );
        if (!hasComputeEngineAutoscalerKey) {
          throw new IntegrationMissingKeyError(
            `Cannot build Relationship.
                        Error: Missing Key.
                        computeEngineRegionAutoscalerKey : ${computeEngineRegionAutoscalerKey}`,
          );
        }

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: computeEngineRegionAutoscalerKey,
            fromType: ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
            toKey: autoscalerRegionPolicyEntity._key,
            toType: ENTITY_TYPE_AUTOSCALER_REGION_POLICY,
          }),
        );
      }
    },
  );
}

export const buildComputeEngineRegionAutoscalerRegionPolicyRelationshipStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS_AND_REGION_POLICY_RELATIONSHIPS,
    name: 'Build Compute Engine Region Autoscaler and Region Policy Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALERS_HAS_REGION_POLICY,
        sourceType: ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
        targetType: ENTITY_TYPE_AUTOSCALER_REGION_POLICY,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS,
      STEP_AUTOSCALER_REGION_POLICY,
    ],
    executionHandler:
      buildComputeEngineRegionAutoscalerRegionPolicyRelationship,
  };
