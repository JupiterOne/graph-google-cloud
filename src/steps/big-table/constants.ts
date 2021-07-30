export const STEP_BIG_TABLE_INSTANCES = 'fetch-bigtable-instances';
export const STEP_BIG_TABLE_APP_PROFILES = 'fetch-bigtable-app-profiles';
export const STEP_BIG_TABLE_CLUSTERS = 'fetch-bigtable-clusters';
export const STEP_BIG_TABLE_BACKUPS = 'fetch-bigtable-backups';
export const STEP_BIG_TABLE_TABLES = 'fetch-bigtable-tables';

export const ENTITY_CLASS_BIG_TABLE_INSTANCE = 'Database';
export const ENTITY_TYPE_BIG_TABLE_INSTANCE = 'google_bigtable_instance';

export const ENTITY_CLASS_BIG_TABLE_APP_PROFILE = 'Configuration';
export const ENTITY_TYPE_BIG_TABLE_APP_PROFILE = 'google_bigtable_app_profile';

export const ENTITY_CLASS_BIG_TABLE_CLUSTER = 'Cluster';
export const ENTITY_TYPE_BIG_TABLE_CLUSTER = 'google_bigtable_cluster';

export const ENTITY_CLASS_BIG_TABLE_BACKUP = 'Backup';
export const ENTITY_TYPE_BIG_TABLE_BACKUP = 'google_bigtable_backup';

export const ENTITY_CLASS_BIG_TABLE_TABLE = 'DataCollection';
export const ENTITY_TYPE_BIG_TABLE_TABLE = 'google_bigtable_table';

export const RELATIONSHIP_TYPE_INSTANCE_HAS_APP_PROFILE =
  'google_bigtable_instance_has_app_profile';

export const RELATIONSHIP_TYPE_INSTANCE_HAS_CLUSTER =
  'google_bigtable_instance_has_cluster';

export const RELATIONSHIP_TYPE_CLUSTER_HAS_BACKUP =
  'google_bigtable_cluster_has_backup';

export const RELATIONSHIP_TYPE_INSTANCE_HAS_TABLE =
  'google_bigtable_instance_has_table';

export const RELATIONSHIP_TYPE_TABLE_HAS_BACKUP =
  'google_bigtable_table_has_backup';

export const RELATIONSHIP_TYPE_CLUSTER_USES_KMS_KEY =
  'google_bigtable_cluster_uses_kms_key';
