import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { CloudBuildClient } from './client';
import { CloudBuildEntities, CloudBuildSteps } from './constants';
import { createBuildEntity } from './converters';

export async function fetchBuilds(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new CloudBuildClient({ config });

  await client.iterateBuilds(async (build) => {
    await jobState.addEntity(createBuildEntity(build));
  });
}

export const cloudBuildSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    ...CloudBuildSteps.FETCH_BUILDS,
    entities: [CloudBuildEntities.BUILD],
    relationships: [],
    executionHandler: fetchBuilds,
  },
];
