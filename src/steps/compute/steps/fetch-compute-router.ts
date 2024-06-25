import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  ComputePermissions,
  STEP_COMPUTE_ROUTER,
  Entities,
} from '../constants';
import { createComputeRouterEntity } from '../converters';

export async function fetchComputeRouters(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateComputeRouter(async (router) => {
    await jobState.addEntity(
      createComputeRouterEntity(router, client.projectId),
    );
  });
}

export const fetchComputeRouterStepsMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_ROUTER,
  ingestionSourceId: IngestionSources.COMPUTE_ROUTER,
  name: 'Compute Router',
  entities: [
    Entities.COMPUTE_ROUTER
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchComputeRouters,
  permissions: ComputePermissions.STEP_COMPUTE_ROUTER,
  apis: ['compute.googleapis.com'],
};
