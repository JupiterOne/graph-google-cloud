import { getRawData } from '@jupiterone/integration-sdk-core';
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
  STEP_AUTOSCALER_POLICY,
  ENTITY_TYPE_AUTOSCALER_POLICY,
  ENTITY_CLASS_AUTOSCALER_POLICY,
} from '../constants';
import { compute_v1 } from 'googleapis';
import { createAutoScalersPolicyEntity } from '../converters';

export async function fetchAutoScalersPolicy(
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
    { _type: ENTITY_TYPE_COMPUTE_ENGINE_AUTOSCALER },
    async (computeEngineAutoscalerEntity) => {
      const autoscaler = getRawData<compute_v1.Schema$Autoscaler>(
        computeEngineAutoscalerEntity,
      );
      if (!autoscaler?.autoscalingPolicy) {
        logger.warn(
          {
            _key: computeEngineAutoscalerEntity._key,
          },
          'Could not find raw data on compute engine autoscaler Policy',
        );
        return;
      }
      await jobState.addEntity(
        createAutoScalersPolicyEntity(
          autoscaler?.autoscalingPolicy,
          client.projectId,
          autoscaler.id,
          autoscaler.name,
        ),
      );
    },
  );
}

export const fetchAutoScalersPolicyMap: GoogleCloudIntegrationStep = {
  id: STEP_AUTOSCALER_POLICY,
  ingestionSourceId: IngestionSources.COMPUTE_AUTOSCALER_POLICY,
  name: 'AutoScalers Policy',
  entities: [
    {
      resourceName: 'AutoScalers Policy',
      _type: ENTITY_TYPE_AUTOSCALER_POLICY,
      _class: ENTITY_CLASS_AUTOSCALER_POLICY,
    },
  ],
  relationships: [],
  executionHandler: fetchAutoScalersPolicy,
  dependsOn: [STEP_COMPUTE_ENGINE_AUTOSCALERS],
  permissions: ComputePermissions.STEP_AUTOSCALER_POLICY,
  apis: ['compute.googleapis.com'],
};
