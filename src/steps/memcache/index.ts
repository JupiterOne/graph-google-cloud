import {
  createDirectRelationship,
  getRawData,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { memcache_v1 } from 'googleapis';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
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
  STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS,
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
    logger,
  } = context;

  const client = new MemcacheClient({ config }, logger);

  await client.iterateMemcachedInstances(async (instance) => {
    const memcacheInstanceEntity = createMemcacheInstanceEntity(
      instance,
      client.projectId,
    );
    await jobState.addEntity(memcacheInstanceEntity);

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

export async function buildMemcacheInstancesUsesNetworkRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_MEMCACHE_INSTANCE },
    async (memcacheInstanceEntity) => {
      const instance = getRawData<memcache_v1.Schema$Instance>(
        memcacheInstanceEntity,
      );
      if (!instance) {
        logger.warn(
          {
            _key: memcacheInstanceEntity._key,
          },
          'Could not find raw data on memcached instance entity',
        );
        return;
      }

      const authorizedNetwork = instance.authorizedNetwork;
      if (!authorizedNetwork) {
        return;
      }

      const authorizedNetworkEntity = await jobState.findEntity(
        `https://www.googleapis.com/compute/v1/${authorizedNetwork}`,
      );
      if (!authorizedNetworkEntity) {
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          from: memcacheInstanceEntity,
          to: authorizedNetworkEntity,
        }),
      );
    },
  );
}

export const memcacheSteps: GoogleCloudIntegrationStep[] = [
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
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_HAS_NODE,
        sourceType: ENTITY_TYPE_MEMCACHE_INSTANCE,
        targetType: ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
      },
    ],
    dependsOn: [],
    executionHandler: fetchMemcacheInstances,
    permissions: ['memcache.instances.list'],
    apis: ['memcache.googleapis.com'],
  },
  {
    id: STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS,
    name: 'Build Memcache Instance Network Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_USES_NETWORK,
        sourceType: ENTITY_TYPE_MEMCACHE_INSTANCE,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
    ],
    dependsOn: [STEP_MEMCACHE_INSTANCES, STEP_COMPUTE_NETWORKS],
    executionHandler: buildMemcacheInstancesUsesNetworkRelationships,
  },
];
