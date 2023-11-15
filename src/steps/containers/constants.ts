export const CONTAINER_CLUSTER_ENTITY_CLASS = 'Cluster';
export const CONTAINER_CLUSTER_ENTITY_TYPE = 'google_container_cluster';

export const CONTAINER_NODE_POOL_ENTITY_CLASS = 'Group';
export const CONTAINER_NODE_POOL_ENTITY_TYPE = 'google_container_node_pool';

export const STEP_CONTAINER_CLUSTERS = 'fetch-container-clusters';

export const RELATIONSHIP_TYPE_CONTAINER_CLUSTER_HAS_NODE_POOL =
  'google_container_cluster_has_node_pool';

export const RELATIONSHIP_TYPE_CONTAINER_NODE_POOL_HAS_INSTANCE_GROUP =
  'google_container_node_pool_has_compute_instance_group';

export const IngestionSources = {
  CONTAINER_CLUSTERS: 'container-clusters',
};

export const ContainersIngestionConfig = {
  [IngestionSources.CONTAINER_CLUSTERS]: {
    title: 'Google Kubernetes Engine Clusters',
    description: 'Container clusters for app deployment.',
    defaultsToDisabled: false,
  },
};
