import { getRawData } from '@jupiterone/integration-sdk-core';
import {
    GoogleCloudIntegrationStep,
    IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
    IngestionSources,
    ComputePermissions,
    STEP_AUTOSCALER_REGION_POLICY,
    ENTITY_TYPE_AUTOSCALER_REGION_POLICY,
    ENTITY_CLASS_AUTOSCALER_REGION_POLICY,
    STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS,
    ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
} from '../constants';
import { compute_v1 } from 'googleapis';
import { createAutoScalersRegionPolicyEntity } from '../converters';

export async function fetchAutoScalersRegionPolicy(
    context: IntegrationStepContext,
): Promise<void> {
    const { jobState, logger } = context;
    const client = new ComputeClient(
        {
            config: context.instance.config,
        },
        logger,
    );
    await jobState.iterateEntities(
        { _type: ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER },
        async (computeEngineAutoscalerEntity) => {
            const regionAutoscaler = getRawData<compute_v1.Schema$Autoscaler>(computeEngineAutoscalerEntity);
            if (!regionAutoscaler?.autoscalingPolicy) {
                logger.warn(
                    {
                        _key: computeEngineAutoscalerEntity._key,
                    },
                    'Could not find raw data on compute engine Region autoscaler Policy',
                );
                return;
            }
            await jobState.addEntity(createAutoScalersRegionPolicyEntity(regionAutoscaler?.autoscalingPolicy,
                client.projectId, regionAutoscaler.id, regionAutoscaler.name));
        },
    );
}

export const fetchAutoScalersRegionPolicyMap: GoogleCloudIntegrationStep = {
    id: STEP_AUTOSCALER_REGION_POLICY,
    ingestionSourceId: IngestionSources.COMPUTE_AUTOSCALER_REGION_POLICY,
    name: 'AutoScalers Region Policy',
    entities: [
        {
            resourceName: 'AutoScalers Region Policy',
            _type: ENTITY_TYPE_AUTOSCALER_REGION_POLICY,
            _class: ENTITY_CLASS_AUTOSCALER_REGION_POLICY,
        },
    ],
    relationships: [],
    executionHandler: fetchAutoScalersRegionPolicy,
    dependsOn: [STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS],
    permissions: ComputePermissions.STEP_AUTOSCALER_REGION_POLICY,
    apis: ['compute.googleapis.com'],
};
