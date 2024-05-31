export const STEP_CLOUD_SQL = 'fetch-cloud-sql';
export const ENTITY_TYPE_CLOUD_SQL = 'google_cloud_sql';
export const ENTITY_CLASS_CLOUD_SQL = ['Service'];

export const STEP_CLOUD_SQL_SSL_CERTIFICATION =
  'fetch-cloud-sql-ssl-certification';
export const ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION =
  'google_cloud_sql_ssl_certificate';
export const ENTITY_CLASS_CLOUD_SQL_SSL_CERTIFICATION = ['Certificate'];

export const STEP_CLOUD_SQL_INSTANCES = 'fetch-cloud-sql-instances';
export const ENTITY_TYPE_CLOUD_SQL_INSTANCES = 'google_cloud_sql_instance';
export const ENTITY_CLASS_CLOUD_SQL_INSTANCES = ['Database'];

export const STEP_CLOUD_SQL_BACKUP = 'fetch-cloud-sql-backup';
export const ENTITY_TYPE_CLOUD_SQL_BACKUP = 'google_cloud_sql_backup';
export const ENTITY_CLASS_CLOUD_SQL_BACKUP = ['Backup'];

export const STEP_CLOUD_SQL_DATABASE = 'fetch-cloud-sql-database';
export const ENTITY_TYPE_CLOUD_SQL_DATABASE = 'google_cloud_sql_database';
export const ENTITY_CLASS_CLOUD_SQL_DATABASE = ['Database'];

export const STEP_CLOUD_USER = 'fetch-cloud-user';
export const ENTITY_TYPE_CLOUD_USER = 'google_user';
export const ENTITY_CLASS_CLOUD_USER = ['User'];

export const STEP_CLOUD_SQL_CONNECTION = 'fetch-cloud-sql-connection';
export const ENTITY_TYPE_CLOUD_SQL_CONNECTION = 'google_cloud_sql_connection';
export const ENTITY_CLASS_CLOUD_SQL_CONNECTION = ['Network'];

export const STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL = 'fetch-project-has-sql';
export const RELATIONSHIP_TYPE_CLOUD_PROJECT_HAS_CLOUD_SQL =
  'google_cloud_project_has_sql';

export const STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES =
  'fetch-cloud-sql-has-sql-instances';
export const RELATIONSHIP_TYPE_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES =
  'google_cloud_sql_has_instance';

// export const STEP_CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP =
//   'fetch-cloud-sql-ssl-certification-has-sql-backup';
// export const RELATIONSHIP_TYPE_CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP =
//   'google_cloud_sql_ssl_certificate_has_sql_backup';

export const STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP =
  'fetch-cloud-sql-instances-has-sql-backup';
export const RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP =
  'google_cloud_sql_instance_has_backup';

export const STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION =
  'fetch-cloud-sql-instances-uses-sql-ssl-certification';
export const RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION =
  'google_cloud_sql_instance_uses_ssl_certificate';

export const STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION =
  'fetch-cloud-sql-instances-has-connection';
export const RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION =
  'google_cloud_sql_instance_has_connection';

export const STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE =
  'fetch-cloud-sql-instances-uses-sql-database';
export const RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE =
  'google_cloud_sql_instance_uses_database';

export const STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER =
  'fetch-cloud-sql-instances-assigned-google-user';
export const RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER =
  'google_cloud_sql_instance_assigned_user';

export const STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE =
  'fetch-cloud-sql-has-sql-database';
export const RELATIONSHIP_TYPE_GOOGLE_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE =
  'google_cloud_sql_has_database';

export const IngestionSources = {
  CLOUD_SQL: 'cloud-sql',
  CLOUD_SQL_SSL_CERTIFICATION: 'cloud-sql-ssl-certification',
  CLOUD_SQL_INSTANCES: 'cloud-sql-instances',
  CLOUD_SQL_BACKUP: 'cloud-sql-backup',
  CLOUD_SQL_DATABASE: 'cloud-sql-database',
  CLOUD_SQL_CONNECTION: 'cloud-sql-connection',
  CLOUD_USER: 'google-user',
  CLOUD_PROJECT_HAS_CLOUD_SQL: 'cloud-project-has-cloud-sql',
  CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES: 'cloud-sql-has-sql-instances',
  CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP:
    'cloud-sql-ssl-certification-has-sql-backup',
  CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP:
    'cloud-sql-instances-has-sql-backup',
  CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION:
    'cloud-sql-instances-has-sql-ssl-certification',
  CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION:
    'cloud-sql-instances-has-sql-connection',
  CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE:
    'cloud-sql-instances-has-sql-database',
  CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER:
    'cloud-sql-instances-assigned-google-user',
  CLOUD_SQL_HAS_CLOUD_SQL_DATABASE: 'cloud-sql-has-sql-database',
};

export const CloudRunIngestionConfig = {
  [IngestionSources.CLOUD_SQL_SSL_CERTIFICATION]: {
    title: 'Google Cloud SQL SSL Certification',
    description: 'Google Cloud SQL SSL Certification',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_INSTANCES]: {
    title: 'Google Cloud SQL Instances',
    description: 'Google Cloud SQL Instances',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_BACKUP]: {
    title: 'Google Cloud SQL Backup',
    description: 'Google Cloud SQL Backup',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_DATABASE]: {
    title: 'Google Cloud SQL Database',
    description: 'Google Cloud SQL Database',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_CONNECTION]: {
    title: 'Google Cloud SQL Connection',
    description: 'Google Cloud SQL Connection',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES]: {
    title: 'Google Cloud SQL Has SQL Instances',
    description: 'Google Cloud SQL Has SQL Instances',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP]: {
    title: 'Google Cloud SQL SSL Certification Has SQL Backup',
    description: 'Google Cloud SQL SSL Certification Has SQL Backup',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP]: {
    title: 'Google Cloud SQL Instances Has SQL Backup',
    description: 'Google Cloud SQL Instances Has SQL Backup',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION]: {
    title: 'Google Cloud SQL Instances Uses SSL Certification',
    description: 'Google Cloud SQL Instances Uses SSL Certification',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION]: {
    title: 'Google Cloud SQL Instances Has SQL Connection',
    description: 'Google Cloud SQL Instances Has SQL Connection',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE]: {
    title: 'Google Cloud SQL Instances Uses Database',
    description: 'Google Cloud SQL Instances Uses Database',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER]: {
    title: 'Google Cloud SQL Instances Uses Google User',
    description: 'Google Cloud SQL Instances Uses Google User',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_SQL_HAS_CLOUD_SQL_DATABASE]: {
    title: 'Google Cloud SQL Has Database',
    description: 'Google Cloud SQL Has Database',
    defaultsToDisabled: false,
  },
};

export const CloudSqlPermissions = {
  STEP_CLOUD_SQL_INSTANCES: ['sql.instances.list'],
  STEP_CLOUD_SQL_SSL_CERTIFICATION: ['sql.sslCerts.list'],
  STEP_CLOUD_SQL_BACKUP: ['sql.backupRuns.list'],
  STEP_CLOUD_SQL_CONNECTION: ['sql.connections.list'],
  STEP_CLOUD_SQL_DATABASE: ['sql.databases.list'],
  STEP_CLOUD_USER: ['iam.serviceAccounts.list'],
};
