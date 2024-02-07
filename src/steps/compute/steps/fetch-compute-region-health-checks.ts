import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
} from '../constants';
import { createRegionHealthCheckEntity } from '../converters';

export async function fetchComputeRegionHealthChecks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
      onRetry(err) {
        context.logger.info({ err }, 'Retrying API call');
      },
    },
    logger,
  );

  await client.iterateRegionHealthChecks(async (healthCheck) => {
    const healthCheckEntity = createRegionHealthCheckEntity(
      healthCheck,
      client.projectId,
    );
    await jobState.addEntity(healthCheckEntity);
  });
}

export const fetchComputeRegionHealthChecksStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_REGION_HEALTH_CHECKS,
    ingestionSourceId: IngestionSources.COMPUTE_REGION_HEALTH_CHECKS,
    name: 'Compute Region Health Checks',
    entities: [
      {
        resourceName: 'Compute Region Health Check',
        _type: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
        _class: ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchComputeRegionHealthChecks,
    permissions: ['compute.regionHealthChecks.list'],
    apis: ['compute.googleapis.com'],
  };
