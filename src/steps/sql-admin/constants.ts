export const CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS = 'Database';
export const CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE =
  'google_cloud_sql_mysql_instance';

export const CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS = 'Database';
export const CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE =
  'google_cloud_sql_postgres_instance';

export const CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS = 'Database';
export const CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE =
  'google_cloud_sql_sql_server_instance';

export const STEP_CLOUD_SQL_ADMIN_INSTANCES = 'fetch-cloud-sql-admin-instances';

export enum DATABASE_TYPE {
  MYSQL = 'MYSQL',
  POSTGRES = 'POSTGRES',
  SQL_SERVER = 'SQLSERVER',
}
