import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { STEP_COMPUTE_NETWORKS } from '../compute';
import { RedisClient } from './client';
import {
  ENTITY_CLASS_REDIS_INSTANCE,
  ENTITY_TYPE_REDIS_INSTANCE,
  STEP_REDIS_INSTANCES,
  RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK,
} from './constants';
import { ENTITY_TYPE_COMPUTE_NETWORK } from '../compute/constants';
import { createRedisInstanceEntity } from './converter';

export async function fetchRedisInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new RedisClient({ config });

  await client.iterateRedisInstances(async (instance) => {
    const redisEntity = createRedisInstanceEntity(instance, client.projectId);
    await jobState.addEntity(redisEntity);

    const networkEntity = await jobState.findEntity(
      `https://www.googleapis.com/compute/v1/${instance.authorizedNetwork}`,
    );
    if (networkEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          from: redisEntity,
          to: networkEntity,
        }),
      );
    }
  });
}

export const redisSteps: IntegrationStep<IntegrationConfig>[] = [
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
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK,
        sourceType: ENTITY_TYPE_REDIS_INSTANCE,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
    ],
    dependsOn: [STEP_COMPUTE_NETWORKS],
    executionHandler: fetchRedisInstances,
  },
];
