import {
    RelationshipClass,
    createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
    GoogleCloudIntegrationStep,
    IntegrationStepContext,
} from '../../../types';
import {
    STEP_PROJECT_COMPUTE_ENGINE_AUTOSCALERS_RELATIONSHIPS,
    RELATIONSHIP_TYPE_PROJECT_HAS_COMPUTE_ENGINE_AUTOSCALERS,
    ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
    STEP_COMPUTE_ENGINE_AUTOSCALERS,
} from '../constants';
import { PROJECT_ENTITY_TYPE, STEP_RESOURCE_MANAGER_PROJECT } from '../../resource-manager/constants'
import { getProjectEntity } from '../../../utils/project';

export async function buildProjectComputeEngineAutoscalersRelationship(
    context: IntegrationStepContext,
): Promise<void> {
    const { jobState } = context;

    const projectEntity = await getProjectEntity(jobState);

    if (!projectEntity) return;

    await jobState.iterateEntities(
        { _type: ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER },
        async (computeEngineAutoscalerEntity) => {
            await jobState.addRelationship(
                createDirectRelationship({
                    _class: RelationshipClass.HAS,
                    fromKey: projectEntity._key as string,
                    fromType: PROJECT_ENTITY_TYPE,
                    toKey: computeEngineAutoscalerEntity._key as string,
                    toType: ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
                }),
            );
        },
    );
}

export const buildProjectComputeEngineAutoscalersRelationshipStepMap: GoogleCloudIntegrationStep =
{
    id: STEP_PROJECT_COMPUTE_ENGINE_AUTOSCALERS_RELATIONSHIPS,
    name: 'Build Project Compute Engine Autoscaler Relationships',
    entities: [],
    relationships: [
        {
            _class: RelationshipClass.HAS,
            _type: RELATIONSHIP_TYPE_PROJECT_HAS_COMPUTE_ENGINE_AUTOSCALERS,
            sourceType: PROJECT_ENTITY_TYPE,
            targetType: ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
        },
    ],
    dependsOn: [STEP_COMPUTE_ENGINE_AUTOSCALERS, STEP_RESOURCE_MANAGER_PROJECT],
    executionHandler: buildProjectComputeEngineAutoscalersRelationship,
};
