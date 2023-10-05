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
} from './constants';
import { ENTITY_TYPE_COMPUTE_NETWORK } from '../compute/constants';
import { createRedisInstanceEntity } from './converter';
import { redis_v1 } from 'googleapis';

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

export const redisSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_REDIS_INSTANCES,
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
];
