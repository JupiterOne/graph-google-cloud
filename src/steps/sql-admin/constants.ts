export const SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS = 'Database';
export const SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE = 'google_sql_mysql_instance';

export const SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS = 'Database';
export const SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE =
  'google_sql_postgres_instance';

export const SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS = 'Database';
export const SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE =
  'google_sql_sql_server_instance';

export const SQL_POSTGRES_INSTANCE_USES_KMS_KEY_RELATIONSHIP =
  'google_sql_postgres_instance_uses_kms_crypto_key';
export const SQL_MYSQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP =
  'google_sql_mysql_instance_uses_kms_crypto_key';
export const SQL_SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP =
  'google_sql_sql_server_uses_kms_crypto_key';

export const STEP_SQL_ADMIN_INSTANCES = 'fetch-sql-admin-instances';

export const SqlAdminSteps = {
  BUILD_SQL_INSTANCE_KMS_KEY_RELATIONSHIPS:
    'build-sql-admin-instance-kms-key-relationships',
};

export enum DATABASE_TYPE {
  MYSQL = 'MYSQL',
  POSTGRES = 'POSTGRES',
  SQL_SERVER = 'SQLSERVER',
}
