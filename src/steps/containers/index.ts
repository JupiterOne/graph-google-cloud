import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { ContainerClient } from './client';
import {
  STEP_CONTAINER_CLUSTERS,
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_CLUSTER_ENTITY_CLASS,
} from './constants';
import { createContainerClusterEntity } from './converters';

export * from './constants';

export async function fetchContainerClusters(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ContainerClient({ config });

  await client.iterateClusters(async (cluster) => {
    await jobState.addEntity(createContainerClusterEntity(cluster));
  });
}

export const containerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_CONTAINER_CLUSTERS,
    name: 'Container Clusters',
    entities: [
      {
        resourceName: 'Container Cluster',
        _type: CONTAINER_CLUSTER_ENTITY_TYPE,
        _class: CONTAINER_CLUSTER_ENTITY_CLASS,
      },
    ],
    relationships: [],
    executionHandler: fetchContainerClusters,
  },
];
