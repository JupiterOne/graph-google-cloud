import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { ContainerClient } from './client';
import {
  STEP_CONTAINER_CLUSTERS,
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_CLUSTER_ENTITY_CLASS,
  CONTAINER_NODE_POOL_ENTITY_TYPE,
  RELATIONSHIP_TYPE_CONTAINER_CLUSTER_HAS_NODE_POOL,
  CONTAINER_NODE_POOL_ENTITY_CLASS,
} from './constants';
import {
  createContainerClusterEntity,
  createContainerNodePoolEntity,
} from './converters';

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
    const clusterEntity = createContainerClusterEntity(
      cluster,
      client.projectId,
    );
    await jobState.addEntity(clusterEntity);

    const nodePools = cluster.nodePools || [];
    for (const nodePool of nodePools) {
      const nodePoolEntity = createContainerNodePoolEntity(
        nodePool,
        client.projectId,
        cluster.location as string,
        cluster.name as string,
      );

      await jobState.addEntity(nodePoolEntity);
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: clusterEntity,
          to: nodePoolEntity,
        }),
      );
    }
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
      {
        resourceName: 'Container Node Pool',
        _type: CONTAINER_NODE_POOL_ENTITY_TYPE,
        _class: CONTAINER_NODE_POOL_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_CONTAINER_CLUSTER_HAS_NODE_POOL,
        sourceType: CONTAINER_CLUSTER_ENTITY_TYPE,
        targetType: CONTAINER_NODE_POOL_ENTITY_TYPE,
      },
    ],
    executionHandler: fetchContainerClusters,
  },
];
