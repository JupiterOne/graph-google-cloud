import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  STEP_COMPUTE_INSTANCE_GROUPS,
} from '../compute';
import { ContainerClient } from './client';
import {
  STEP_CONTAINER_CLUSTERS,
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_CLUSTER_ENTITY_CLASS,
  CONTAINER_NODE_POOL_ENTITY_TYPE,
  RELATIONSHIP_TYPE_CONTAINER_CLUSTER_HAS_NODE_POOL,
  CONTAINER_NODE_POOL_ENTITY_CLASS,
  RELATIONSHIP_TYPE_CONTAINER_NODE_POOL_HAS_INSTANCE_GROUP,
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
    logger,
  } = context;
  const client = new ContainerClient({ config }, logger);

  await client.iterateClusters(async (cluster) => {
    const clusterEntity = createContainerClusterEntity(
      cluster,
      client.projectId,
    );

    if (clusterEntity._key.startsWith('https://container.googleapis.com/')) {
      // NOTE: This should be removed after giving a bit of time to validate
      // whether every GKE cluster has an `id` property
      context.logger.info(
        {
          _key: clusterEntity._key,
        },
        'GKE cluster key did not have an ID property',
      );
    }

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

      // Add google_container_node_pool -> HAS -> google_compute_instance_group
      for (const instanceGroupUrl of nodePool.instanceGroupUrls || []) {
        // Instance group entity have keys of this format:
        // https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/zones/us-central1-c/instanceGroups/gke-j1-gc-integratio-j1-gc-integratio-e1c64cb5-grp
        // Node pools have pointers to their instance groups in this format:
        // https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/zones/us-central1-c/instanceGroupManagers/gke-j1-gc-integratio-j1-gc-integratio-e1c64cb5-grp
        // If we replace instanceGroupManagers with instanceGroups we can use it as _key for jobState.findEntity() and avoid having to use jobState.iterateEntities()
        const instanceGroupEntity = await jobState.findEntity(
          instanceGroupUrl.replace('instanceGroupManagers', 'instanceGroups'),
        );

        if (instanceGroupEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: nodePoolEntity,
              to: instanceGroupEntity,
            }),
          );
        }
      }
    }
  });
}

export const containerSteps: GoogleCloudIntegrationStep[] = [
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
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_CONTAINER_NODE_POOL_HAS_INSTANCE_GROUP,
        sourceType: CONTAINER_NODE_POOL_ENTITY_TYPE,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      },
    ],
    dependsOn: [STEP_COMPUTE_INSTANCE_GROUPS],
    executionHandler: fetchContainerClusters,
    permissions: ['container.clusters.list'],
    apis: ['container.googleapis.com'],
  },
];
