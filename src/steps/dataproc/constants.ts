export const STEP_DATAPROC_CLUSTERS = 'fetch-dataproc-clusters';
export const STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS =
  'build-dataproc-cluster-kms-relationships';

export const STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS =
  'create-cluster-storage-relationships';
export const STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS =
  'create-cluster-image-relationships';

export const ENTITY_CLASS_DATAPROC_CLUSTER = 'Cluster';
export const ENTITY_TYPE_DATAPROC_CLUSTER = 'google_dataproc_cluster';

export const RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY =
  'google_dataproc_cluster_uses_kms_crypto_key';
export const RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_STORAGE_BUCKET =
  'google_dataproc_cluster_uses_storage_bucket';
export const RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_COMPUTE_IMAGE =
  'google_dataproc_cluster_uses_compute_image';
