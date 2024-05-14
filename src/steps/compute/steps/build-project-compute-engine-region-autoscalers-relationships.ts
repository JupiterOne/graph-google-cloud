import {
    RelationshipClass,
    createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
    GoogleCloudIntegrationStep,
    IntegrationStepContext,
} from '../../../types';
import {
    RELATIONSHIP_TYPE_PROJECT_HAS_COMPUTE_ENGINE_REGION_AUTOSCALERS,
    STEP_PROJECT_COMPUTE_ENGINE_REGION_AUTOSCALERS_RELATIONSHIPS,
    STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS,
    ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
} from '../constants';
import { PROJECT_ENTITY_TYPE, STEP_RESOURCE_MANAGER_PROJECT } from '../../resource-manager';
import { getProjectEntity } from '../../../utils/project';

export async function buildProjectComputeEngineRegionAutoscalersRelationship(
    context: IntegrationStepContext,
): Promise<void> {
    const { jobState } = context;

    const projectEntity = await getProjectEntity(jobState);

    if (!projectEntity) return;

    await jobState.iterateEntities(
        { _type: ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER },
        async (computeEngineAutoscalerEntity) => {
            await jobState.addRelationship(
                createDirectRelationship({
                    _class: RelationshipClass.HAS,
                    fromKey: projectEntity._key as string,
                    fromType: PROJECT_ENTITY_TYPE,
                    toKey: computeEngineAutoscalerEntity._key as string,
                    toType: ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
                }),
            );
        },
    );
}

export const buildProjectComputeEngineRegionAutoscalersRelationshipMap: GoogleCloudIntegrationStep =
{
    id: STEP_PROJECT_COMPUTE_ENGINE_REGION_AUTOSCALERS_RELATIONSHIPS,
    name: 'Build Project Compute Engine Region Autoscaler Relationships',
    entities: [],
    relationships: [
        {
            _class: RelationshipClass.HAS,
            _type: RELATIONSHIP_TYPE_PROJECT_HAS_COMPUTE_ENGINE_REGION_AUTOSCALERS,
            sourceType: PROJECT_ENTITY_TYPE,
            targetType: ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
        },
    ],
    dependsOn: [STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS, STEP_RESOURCE_MANAGER_PROJECT],
    executionHandler: buildProjectComputeEngineRegionAutoscalersRelationship,
};
