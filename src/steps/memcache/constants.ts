export const STEP_MEMCACHE_INSTANCES = 'fetch-memcache-instances';
export const STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS =
  'build-memcache-instance-network-relationships';

export const ENTITY_TYPE_MEMCACHE_INSTANCE = 'google_memcache_instance';
export const ENTITY_CLASS_MEMCACHE_INSTANCE = [
  'Database',
  'DataStore',
  'Cluster',
];

export const ENTITY_TYPE_MEMCACHE_INSTANCE_NODE =
  'google_memcache_instance_node';
export const ENTITY_CLASS_MEMCACHE_INSTANCE_NODE = [
  'Database',
  'DataStore',
  'Host',
];

export const RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_USES_NETWORK =
  'google_memcache_instance_uses_compute_network';
export const RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_HAS_NODE =
  'google_memcache_instance_has_node';
