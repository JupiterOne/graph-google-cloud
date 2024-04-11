export const STEP_ALLOYDB_POSTGRE_SQL_SERVICE = 'create-postgre-sql-service';
export const STEP_ALLOYDB_POSTGRE_SQL_CLUSTER =
  'fetch-alloydb-postgre-sql-cluster';
export const STEP_ALLOYDB_POSTGRE_SQL_INSTANCE =
  'fetch-alloydb-postgre-sql-instance';
export const STEP_ALLOYDB_POSTGRE_SQL_CONNECTION =
  'fetch-alloydb-postgre-sql-connection';
export const STEP_ALLOYDB_POSTGRE_SQL_BACKUP =
  'fetch-alloydb-postgre-sql-backup';

// Entity type
export const ENTITY_TYPE_ALLOYDB_POSTGRE_SQL_SERVICE = 'google_cloud_alloydb';
export const ENTITY_CLASS_ALLOYDB_POSTGRE_SQL_SERVICE = ['Service'];

export const ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER =
  'google_cloud_alloydb_cluster';
export const ENTITY_CLASS_POSTGRE_SQL_CLUSTER = [
  'Database',
  'DataStore',
  'Cluster',
];

export const ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE =
  'google_cloud_alloydb_instance';
export const ENTITY_CLASS_POSTGRE_SQL_INSTANCE = [
  'Database',
  'DataStore',
  'Host',
];

export const ENTITY_TYPE_POSTGRE_SQL_CONNECTION =
  'google_cloud_alloydb_connection';
export const ENTITY_CLASS_POSTGRE_SQL_CONNECTION = ['Network'];

export const ENTITY_TYPE_POSTGRE_SQL_BACKUP = 'google_cloud_alloydb_backup';
export const ENTITY_CLASS_POSTGRE_SQL_BACKUP = ['Backup'];

// Relationships
export const STEP_PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP =
  'build-project-alloydb-service-relationship';
export const STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP =
  'build-project-has-alloydb-cluster-relationship';

export const STEP_ALLOYDB_INSTANCE_USES_CLUSTER_RELATIONSHIP =
  'build-alloydb-instance-uses-cluster-relationship';

export const STEP_ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP =
  'build-alloydb-cluster-has-backup-relationship';

export const STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP =
  'build-alloydb-instance-has-connection-relationship';

export const STEP_ALLOYDB_CLUSTER_USES_KMS_KEY_RELATIONSHIP =
  'build-alloydb-cluster-uses-kms-key-relationship';

export const STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP =
  'build-user-asssigned-alloydb-cluster-relatipnship';

export const RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_SERVICE =
  'google_cloud_project_has_alloydb';
export const RELATIONSHIP_TYPE_PROJECT_HAS_ALLOYDB_CLUSTER =
  'google_cloud_project_has_alloydb_cluster';
export const RELATIONSHIP_TYPE_ALLOYDB_INSTANCE_USES_CLUSTER =
  'google_cloud_alloydb_instance_uses_cluster';
export const RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_HAS_BACKUP =
  'google_cloud_alloydb_cluster_has_backup';
export const RELATIONSHIP_TYPE_STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP =
  'google_cloud_alloydb_instance_has_connection';
export const RELATIONSHIP_TYPE_ALLOYDB_CLUSTER_USES_KMS_KEY =
  'google_cloud_alloydb_cluster_uses_kms_crypto_key';
export const RELATIONSHIP_TYPE_USER_ASSIGNED_ALLOYDB_CLUSTER =
  'google_user_assigned_cloud_alloydb_cluster';

// IngestionSources
export const IngestionSources = {
  ALLOYDB_POSTGRE_SQL_SERVICE: 'postgre-sql-service',
  ALLOYDB_POSTGRE_SQL_CLUSTER: 'alloydb-postgre-sql-cluster',
  ALLOYDB_POSTGRE_SQL_INSTANCE: 'alloydb-postgre-sql-instance',
  ALLOYDB_POSTGRE_SQL_CONNECTION: 'alloydb-postgre-sql-connection',
  ALLOYDB_POSTGRE_SQL_BACKUP: 'alloydb-postgre-sql-backup',
  PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP:
    'project-has-alloydb-service-relationship',
  PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP:
    'project-has-alloydb-cluster-relationship',
  ALLOYDB_INSTANCE_USES_CLUSTER_RELATIONSHIP:
    'alloydb-instance-uses-cluster-relationship',
  ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP:
    'alloydb-cluster-has-backup-relationship',
  ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP:
    'alloydb-instance-has-connection-relationship',
  ALLOYDB_CLUSTER_USES_KMS_KEY_RELATIONSHIP:
    'alloydb-cluster-uses-kms-key-relationship',
  GOOGLE_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP:
    'google-user-assigned-alloydb-cluster-relationship',
};

// IngestionSources Configs
export const AlloyDBIngestionConfig = {
  [IngestionSources.ALLOYDB_POSTGRE_SQL_SERVICE]: {
    title: 'AlloyDB for Postgre SQL service',
    description: 'AlloyDB for Postgre SQL service.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_POSTGRE_SQL_CLUSTER]: {
    title: 'AlloyDB for Postgre SQL Cluster',
    description: 'AlloyDB for Postgre SQL Cluster.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_POSTGRE_SQL_INSTANCE]: {
    title: 'AlloyDB for Postgre SQL Instance',
    description: 'AlloyDB for Postgre SQL Instance.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_POSTGRE_SQL_CONNECTION]: {
    title: 'AlloyDB for Postgre SQL Connection',
    description: 'AlloyDB for Postgre SQL Connection.',
    defaultsToDisabled: false,
  },
  [IngestionSources.PROJECT_HAS_ALLOYDB_SERVICE_RELATIONSHIP]: {
    title: 'Project AlloyDB Service Has Relationship',
    description: 'Build Project AlloyDB Service Has Relationship.',
    defaultsToDisabled: false,
  },
  [IngestionSources.PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP]: {
    title: 'Project AlloyDB Cluster Has Relationship',
    description: 'Build Project AlloyDB Cluster Has Relationship.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_INSTANCE_USES_CLUSTER_RELATIONSHIP]: {
    title: 'AlloyDB Instance Cluster Uses Relationship',
    description: 'Build AlloyDB Instance Cluster Uses Relationship.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP]: {
    title: 'AlloyDB Instance Backup Has Relationship',
    description: 'Build AlloyDB Backup Cluster Has  Relationship.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP]: {
    title: 'AlloyDB Instance Connection Has  Relationship',
    description: 'Build AlloyDB Instance Connection Has Relationship.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ALLOYDB_CLUSTER_USES_KMS_KEY_RELATIONSHIP]: {
    title: 'AlloyDB Cluster Kms Key Uses Relationship',
    description: 'Build AlloyDB Cluster Kms Key Has Relationship.',
    defaultsToDisabled: false,
  },
};

// IAM Permissions
export const AlloyDBPermissions = {
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER: ['alloydb.clusters.list'],
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE: ['alloydb.instances.list'],
  STEP_ALLOYDB_POSTGRE_SQL_CONNECTION: ['alloydb.instances.connect'],
  STEP_ALLOYDB_POSTGRE_SQL_BACKUP: ['alloydb.backups.get'],
};
