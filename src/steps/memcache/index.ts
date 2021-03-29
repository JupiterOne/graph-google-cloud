import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { ENTITY_TYPE_COMPUTE_NETWORK, STEP_COMPUTE_NETWORKS } from '../compute';
import { MemcacheClient } from './client';
import {
  STEP_MEMCACHE_INSTANCES,
  ENTITY_TYPE_MEMCACHE_INSTANCE,
  ENTITY_CLASS_MEMCACHE_INSTANCE,
  ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
  ENTITY_CLASS_MEMCACHE_INSTANCE_NODE,
  RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_USES_NETWORK,
  RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_HAS_NODE,
} from './constants';
import {
  createMemcacheInstanceEntity,
  createMemcacheNodeEntity,
} from './converter';

export async function fetchMemcacheInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new MemcacheClient({ config });

  await client.iterateMemcachedInstances(async (instance) => {
    const memcacheInstanceEntity = createMemcacheInstanceEntity(
      instance,
      client.projectId,
    );
    await jobState.addEntity(memcacheInstanceEntity);

    const networkEntity = await jobState.findEntity(
      `https://www.googleapis.com/compute/v1/${instance.authorizedNetwork}`,
    );
    if (networkEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          from: memcacheInstanceEntity,
          to: networkEntity,
        }),
      );
    }

    const memcacheNodes = instance.memcacheNodes || [];
    for (const memcacheNode of memcacheNodes) {
      const memcacheNodeEntity = createMemcacheNodeEntity(
        memcacheNode,
        instance.name as string,
        client.projectId,
      );
      await jobState.addEntity(memcacheNodeEntity);

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: memcacheInstanceEntity,
          to: memcacheNodeEntity,
        }),
      );
    }
  });
}

export const memcacheSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_MEMCACHE_INSTANCES,
    name: 'Memcache Instances',
    entities: [
      {
        resourceName: 'Memcache Instance',
        _type: ENTITY_TYPE_MEMCACHE_INSTANCE,
        _class: ENTITY_CLASS_MEMCACHE_INSTANCE,
      },
      {
        resourceName: 'Memcache Instance Node',
        _type: ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
        _class: ENTITY_CLASS_MEMCACHE_INSTANCE_NODE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_USES_NETWORK,
        sourceType: ENTITY_TYPE_MEMCACHE_INSTANCE,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_HAS_NODE,
        sourceType: ENTITY_TYPE_MEMCACHE_INSTANCE,
        targetType: ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
      },
    ],
    dependsOn: [STEP_COMPUTE_NETWORKS],
    executionHandler: fetchMemcacheInstances,
  },
];
