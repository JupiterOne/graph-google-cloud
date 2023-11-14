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

export const IngestionSources = {
  BIG_TABLE_INSTANCES: 'big-table-instances',
  BIG_TABLE_APP_PROFILES: 'big-table-app-profiles',
  BIG_TABLE_CLUSTERS: 'big-table-clusters',
  BIG_TABLE_BACKUPS: 'big-table-backups',
  BIG_TABLE_TABLES: 'big-table-tables',
};

export const BigTableIngestionConfig = {
  [IngestionSources.BIG_TABLE_INSTANCES]: {
    title: 'Google Cloud BigTable Instances',
    description: 'Managed NoSQL database instances.',
    defaultsToDisabled: true,
  },
  [IngestionSources.BIG_TABLE_APP_PROFILES]: {
    title: 'Google Cloud BigTable App Profiles',
    description: 'App profiles for BigTable configuration.',
    defaultsToDisabled: true,
  },
  [IngestionSources.BIG_TABLE_CLUSTERS]: {
    title: 'Google Cloud BigTable Clusters',
    description: 'Cluster management in BigTable.',
    defaultsToDisabled: true,
  },
  [IngestionSources.BIG_TABLE_BACKUPS]: {
    title: 'Google Cloud BigTable Backups',
    description: 'Backup solutions for BigTable data.',
    defaultsToDisabled: true,
  },
  [IngestionSources.BIG_TABLE_TABLES]: {
    title: 'Google Cloud BigTable Tables',
    description: 'Data tables within BigTable.',
    defaultsToDisabled: true,
  },
};
