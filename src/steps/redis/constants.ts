export const STEP_REDIS_INSTANCES = 'fetch-redis-instances';
export const STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS =
  'build-redis-instance-network-relationships';
export const STEP_MEMORYSTORE_REDIS_LOCATION =
  'fetch-memorystore-redis-location';
export const STEP_MEMORYSTORE_REDIS = 'fetch-memorystore-redis';
export const STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP =
  'fetch-project-has-memorystore-redis';
export const STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP =
  'fetch-project-has-memorystore-redis-location';
export const STEP_PROJECT_HAS_REDIS_INSTANCE_RELATIONSHIP =
  'fetch-project-has-redis-instance';
export const STEP_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INSTANCE_RELATIONSHIP =
  'fetch-memorystore-redis-location-has-redis-instance';

export const ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION =
  'google_cloud_redis_location';
export const ENTITY_CLASS_MEMORYSTORE_REDIS_LOCATION = ['Site'];

export const ENTITY_TYPE_REDIS_INSTANCE = 'google_redis_instance';
export const ENTITY_CLASS_REDIS_INSTANCE = ['Database', 'DataStore', 'Host'];

export const ENTITY_TYPE_MEMORYSTORE_REDIS = 'google_cloud_redis';
export const ENTITY_CLASS_MEMORYSTORE_REDIS = ['Service'];

export const RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK =
  'google_redis_instance_uses_compute_network';
export const RELATIONSHIP_TYPE_PROJECT_HAS_MEMORYSTORE_REDIS =
  'google_cloud_project_has_redis';
export const RELATIONSHIP_TYPE_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION =
  'google_cloud_project_has_redis_location';
export const RELATIONSHIP_TYPE_PROJECT_HAS_REDIS_INSTANCE =
  'google_cloud_project_has_redis_instance';
export const RELATIONSHIP_TYPE_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INTANCE =
  'google_cloud_redis_location_has_redis_instance';

export const IngestionSources = {
  REDIS_INSTANCES: 'redis-instances',
  MEMORYSTORE_REDIS_LOCATION: 'memorystore-redis-location',
  MEMORYSTORE_REDIS: 'memorystore-redis',
  RELATIONSHIP_PROJECT_HAS_MEMORYSTORE_REDIS: 'project-has-memorystore-redis',
  RELATIONSHIP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION:
    'project-has-memorystore-redis-location',
  REATIONSHIP_PROJECT_HAS_REDIS_INSTANCE: 'project-has-redis-instance',
  RELATIONSHIP_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INTANCE:
    'memorystore-redis-location-has-redis-instance',
};

export const RedisIngestionConfig = {
  [IngestionSources.REDIS_INSTANCES]: {
    title: 'Google Cloud Redis Instances',
    description: 'Managed Redis in-memory data store.',
    defaultsToDisabled: false,
  },
  [IngestionSources.MEMORYSTORE_REDIS_LOCATION]: {
    title: 'Google Cloud Redis Location',
    description: 'Locations of Redis in-memory data store.',
    defaultsToDisabled: false,
  },
  [IngestionSources.MEMORYSTORE_REDIS]: {
    title: 'Google Cloud Memorystore Redis',
    description: ' Redis in-memory data store.',
    defaultsToDisabled: false,
  },
};
