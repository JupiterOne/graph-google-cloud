import {
    GoogleCloudIntegrationStep,
    IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
    IngestionSources,
    ComputePermissions,
    STEP_COMPUTE_ENGINE_AUTOSCALERS,
    ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
    ENTITY_CLASS_COMPUTE_ENGINE_AUTOSCALERS,
} from '../constants';
import { createComputeEngineAutoScalerEntity } from '../converters';

export async function fetchComputeEngineAutoScalers(
    context: IntegrationStepContext,
): Promise<void> {
    const { jobState, logger } = context;
    const client = new ComputeClient(
        {
            config: context.instance.config,
        },
        logger,
    );

    await client.iterateComputeAutoscaler(async (autoscaler) => {
        await jobState.addEntity(createComputeEngineAutoScalerEntity(autoscaler, client.projectId));
    });
}

export const fetchComputeEngineAutoScalersMap: GoogleCloudIntegrationStep = {
    id: STEP_COMPUTE_ENGINE_AUTOSCALERS,
    ingestionSourceId: IngestionSources.COMPUTE_ENGINE_AUTOSCALERS,
    name: 'Compute Engine AutoScalers',
    entities: [
        {
            resourceName: 'Compute Engine AutoScalers',
            _type: ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER,
            _class: ENTITY_CLASS_COMPUTE_ENGINE_AUTOSCALERS,
        },
    ],
    relationships: [],
    executionHandler: fetchComputeEngineAutoScalers,
    dependsOn: [],
    permissions: ComputePermissions.STEP_COMPUTE_ENGINE_AUTOSCALERS,
    apis: ['compute.googleapis.com'],
};
