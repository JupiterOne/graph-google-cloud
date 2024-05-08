import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_HEALTH_CHECKS,
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
  ComputePermissions,
} from '../constants';
import { createHealthCheckEntity } from '../converters';

export async function fetchComputeHealthChecks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateHealthChecks(async (healthCheck) => {
    const healthCheckEntity = createHealthCheckEntity(
      healthCheck,
      client.projectId,
    );
    await jobState.addEntity(healthCheckEntity);
  });
}

export const fetchComputeHealthChecksStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_HEALTH_CHECKS,
  ingestionSourceId: IngestionSources.COMPUTE_HEALTH_CHECKS,
  name: 'Compute Health Checks',
  entities: [
    {
      resourceName: 'Compute Health Check',
      _type: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
      _class: ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
    },
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchComputeHealthChecks,
  permissions: ComputePermissions.STEP_COMPUTE_HEALTH_CHECKS,
  apis: ['compute.googleapis.com'],
};
