import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  ComputePermissions,
  STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS,
  ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
  ENTITY_CLASS_COMPUTE_ENGINE_REGION_AUTOSCALERS,
} from '../constants';
import { createComputeEngineRegionAutoScalerEntity } from '../converters';

export async function fetchComputeEngineRegionAutoScalers(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateComputeRegionAutoscaler(async (regionAutoscaler) => {
    await jobState.addEntity(
      createComputeEngineRegionAutoScalerEntity(
        regionAutoscaler,
        client.projectId,
      ),
    );
  });
}

export const fetchComputeEngineRegionAutoScalersMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS,
    ingestionSourceId: IngestionSources.COMPUTE_ENGINE_AUTOSCALERS,
    name: 'Compute Engine Region AutoScalers',
    entities: [
      {
        resourceName: 'Compute Engine Region AutoScalers',
        _type: ENTITY_TYPE_COMPUTE_ENGINE_REGION_AUTOSCALER,
        _class: ENTITY_CLASS_COMPUTE_ENGINE_REGION_AUTOSCALERS,
      },
    ],
    relationships: [],
    executionHandler: fetchComputeEngineRegionAutoScalers,
    dependsOn: [],
    permissions: ComputePermissions.STEP_COMPUTE_ENGINE_REGION_AUTOSCALERS,
    apis: ['compute.googleapis.com'],
  };
