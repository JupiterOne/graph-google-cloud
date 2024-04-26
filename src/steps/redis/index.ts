import {
  createDirectRelationship,
  getRawData,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { STEP_COMPUTE_NETWORKS } from '../compute';
import { RedisClient } from './client';
import {
  ENTITY_CLASS_REDIS_INSTANCE,
  ENTITY_TYPE_REDIS_INSTANCE,
  STEP_REDIS_INSTANCES,
  RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK,
  STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS,
  IngestionSources,
  STEP_MEMORYSTORE_REDIS_LOCATION,
  ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION,
  ENTITY_CLASS_MEMORYSTORE_REDIS_LOCATION,
  STEP_MEMORYSTORE_REDIS,
  ENTITY_TYPE_MEMORYSTORE_REDIS,
  ENTITY_CLASS_MEMORYSTORE_REDIS,
  STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP,
  RELATIONSHIP_TYPE_PROJECT_HAS_MEMORYSTORE_REDIS,
  STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP,
  RELATIONSHIP_TYPE_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION,
} from './constants';
import { ENTITY_TYPE_COMPUTE_NETWORK } from '../compute/constants';
import {
  createMemoryStoreRedisEntity,
  createMemoryStoreRedisLocationEntity,
  createRedisInstanceEntity,
} from './converter';
import { redis_v1 } from 'googleapis';
import { publishUnsupportedConfigEvent } from '../../utils/events';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { getProjectEntity } from '../../utils/project';

export async function fetchRedisInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new RedisClient({ config }, logger);

  await client.iterateRedisInstances(async (instance) => {
    const redisEntity = createRedisInstanceEntity(instance, client.projectId);
    await jobState.addEntity(redisEntity);
  });
}

export async function fetchMemoryStoreRedisLocation(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new RedisClient({ config }, logger);

  try {
    await client.iterateMemoryStoreRedisLocation(async (Location) => {
      await jobState.addEntity(
        createMemoryStoreRedisLocationEntity(Location, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'MemoryStore Redis Location',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchMemoryStoreRedis(
  this: {
    id: string;
    ingestionSourceId: string;
    name: string;
    entities: { resourceName: string; _type: string; _class: string[] }[];
    relationships: never[];
    dependsOn: never[];
    executionHandler: (context: IntegrationStepContext) => Promise<void>;
    permissions: never[];
    apis: string[];
  },
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new RedisClient({ config }, logger);
  const organizationId = client.organizationId as string;
  const data = [];
  try {
    await jobState.addEntity(
      createMemoryStoreRedisEntity(data, organizationId, client.projectId),
    );
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'MemoryStore Redis',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function buildRedisInstanceUsesNetworkRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_REDIS_INSTANCE },
    async (redisInstanceEntity) => {
      const instance =
        getRawData<redis_v1.Schema$Instance>(redisInstanceEntity);

      if (!instance) {
        logger.warn(
          {
            _key: redisInstanceEntity._key,
          },
          'Could not find raw data on redis instance entity',
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
          from: redisInstanceEntity,
          to: authorizedNetworkEntity,
        }),
      );
    },
  );
}

export async function buildProjectHasMemoryStoreRedisRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_MEMORYSTORE_REDIS },
    async (redis) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: redis._key as string,
          toType: ENTITY_TYPE_MEMORYSTORE_REDIS,
        }),
      );
    },
  );
}

export async function buildProjectHasMemoryStoreRedisLocationRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION },
    async (location) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: location._key as string,
          toType: ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION,
        }),
      );
    },
  );
}

export const redisSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_REDIS_INSTANCES,
    ingestionSourceId: IngestionSources.REDIS_INSTANCES,
    name: 'Redis Instances',
    entities: [
      {
        resourceName: 'Redis Instance',
        _type: ENTITY_TYPE_REDIS_INSTANCE,
        _class: ENTITY_CLASS_REDIS_INSTANCE,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchRedisInstances,
    permissions: ['redis.instances.list'],
    apis: ['redis.googleapis.com'],
  },
  {
    id: STEP_MEMORYSTORE_REDIS_LOCATION,
    ingestionSourceId: IngestionSources.MEMORYSTORE_REDIS_LOCATION,
    name: 'MemoryStore Redis Location',
    entities: [
      {
        resourceName: 'MemoryStore Redis Location',
        _type: ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION,
        _class: ENTITY_CLASS_MEMORYSTORE_REDIS_LOCATION,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchMemoryStoreRedisLocation,
    permissions: [],
    apis: ['redis.googleapis.com'],
  },
  {
    id: STEP_MEMORYSTORE_REDIS,
    ingestionSourceId: IngestionSources.MEMORYSTORE_REDIS,
    name: 'MemoryStore Redis',
    entities: [
      {
        resourceName: 'MemoryStore Redis',
        _type: ENTITY_TYPE_MEMORYSTORE_REDIS,
        _class: ENTITY_CLASS_MEMORYSTORE_REDIS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchMemoryStoreRedis,
    permissions: [],
    apis: ['redis.googleapis.com'],
  },
  {
    id: STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS,
    name: 'Build Redis Instance Network Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK,
        sourceType: ENTITY_TYPE_REDIS_INSTANCE,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
    ],
    dependsOn: [STEP_REDIS_INSTANCES, STEP_COMPUTE_NETWORKS],
    executionHandler: buildRedisInstanceUsesNetworkRelationships,
  },
  {
    id: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.RELATIONSHIP_PROJECT_HAS_MEMORYSTORE_REDIS,
    name: 'Project HAS MemoryStore Redis',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_MEMORYSTORE_REDIS,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: ENTITY_TYPE_MEMORYSTORE_REDIS,
      },
    ],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_MEMORYSTORE_REDIS],
    executionHandler: buildProjectHasMemoryStoreRedisRelationship,
    permissions: [],
    apis: ['redis.googleapis.com'],
  },
  {
    id: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP,
    ingestionSourceId:
      IngestionSources.RELATION_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION,
    name: 'Project HAS MemoryStore Redis Location',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION,
      },
    ],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_MEMORYSTORE_REDIS_LOCATION],
    executionHandler: buildProjectHasMemoryStoreRedisLocationRelationship,
    permissions: [],
    apis: ['redis.googleapis.com'],
  },
];
