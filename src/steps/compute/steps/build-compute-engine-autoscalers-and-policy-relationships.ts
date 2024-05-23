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
    ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
    STEP_COMPUTE_ENGINE_AUTOSCALERS_AND_POLICY_RELATIONSHIPS,
    RELATIONSHIP_TYPE_COMPUTE_ENGINE_AUTOSCALERS_HAS_POLICY,
    ENTITY_TYPE_AUTOSCALER_POLICY,
    STEP_COMPUTE_ENGINE_AUTOSCALERS,
    STEP_AUTOSCALER_POLICY,
} from '../constants';

export async function buildProjectComputeEngineRegionAutoscalersRelationship(
    context: IntegrationStepContext,
): Promise<void> {
    const { jobState } = context;

    await jobState.iterateEntities(
        { _type: ENTITY_TYPE_AUTOSCALER_POLICY },
        async (autoscalerPolicyEntity) => {
            if (autoscalerPolicyEntity && autoscalerPolicyEntity._key) {
                const numericPartMatch = autoscalerPolicyEntity._key.match(/\d+$/);
                if (numericPartMatch) {
                    const numericPart = numericPartMatch[0];
                    const computeEngineAutoscalerKey = numericPart;
                    const hasComputeEngineAutoscalerKey = jobState.hasKey(computeEngineAutoscalerKey);
                    if (!hasComputeEngineAutoscalerKey) {
                        throw new IntegrationMissingKeyError(
                            `Cannot build Relationship.
                            Error: Missing Key.
                            computeEngineAutoscalerKey : ${computeEngineAutoscalerKey}`,
                        );
                    }

                    await jobState.addRelationship(
                        createDirectRelationship({
                            _class: RelationshipClass.HAS,
                            fromKey: computeEngineAutoscalerKey,
                            fromType: ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
                            toKey: autoscalerPolicyEntity._key,
                            toType: ENTITY_TYPE_AUTOSCALER_POLICY,
                        }),
                    );
                }
            }
        },
    );
}


export const buildComputeEngineAutoscalerPolicyRelationshipStepMap: GoogleCloudIntegrationStep =
{
    id: STEP_COMPUTE_ENGINE_AUTOSCALERS_AND_POLICY_RELATIONSHIPS,
    name: 'Build Compute Engine Autoscaler and Policy Relationships',
    entities: [],
    relationships: [
        {
            _class: RelationshipClass.HAS,
            _type: RELATIONSHIP_TYPE_COMPUTE_ENGINE_AUTOSCALERS_HAS_POLICY,
            sourceType: ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
            targetType: ENTITY_TYPE_AUTOSCALER_POLICY,
        },
    ],
    dependsOn: [STEP_COMPUTE_ENGINE_AUTOSCALERS, STEP_AUTOSCALER_POLICY],
    executionHandler: buildProjectComputeEngineRegionAutoscalersRelationship,
};