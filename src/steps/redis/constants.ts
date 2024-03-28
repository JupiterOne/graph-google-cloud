export const STEP_REDIS_INSTANCES = 'fetch-redis-instances';
export const STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS =
  'build-redis-instance-network-relationships';

export const ENTITY_TYPE_REDIS_INSTANCE = 'google_redis_instance';
export const ENTITY_CLASS_REDIS_INSTANCE = ['Database', 'DataStore', 'Host'];

export const RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK =
  'google_redis_instance_uses_compute_network';

export const IngestionSources = {
  REDIS_INSTANCES: 'redis-instances',
};

export const RedisIngestionConfig = {
  [IngestionSources.REDIS_INSTANCES]: {
    title: 'Google Cloud Redis Instances',
    description: 'Managed Redis in-memory data store.',
    defaultsToDisabled: false,
  },
};

export const RedisPermissions = {
  STEP_REDIS_INSTANCES: ['redis.instances.list'],
};
