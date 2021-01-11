import { sqladmin_v1beta4 } from 'googleapis';
import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import {
  CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
  CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
  CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
} from './constants';

function getFlagValue(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
  name: string,
  defaultValue: string | boolean,
) {
  const databaseFlags = instance.settings?.databaseFlags || [];

  const targetFlag = databaseFlags.find((flag) => flag.name === name);
  return !targetFlag || !targetFlag.value ? defaultValue : targetFlag.value;
}

function getMySQLSpecificBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  // 6.1.2 Ensure that the 'local_infile' database flag for a Cloud SQL Mysql instance is set to 'off' (Scored)
  // Default: 'on'
  const localInfile = getFlagValue(instance, 'local_infile', 'on');

  return {
    localInfile,
  };
}

function getPostgresSpecificBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  // 6.2.1 Ensure that the 'log_checkpoints' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
  // Default: 'off'
  const logCheckpoints = getFlagValue(instance, 'log_checkpoints', 'off');

  // 6.2.2 Ensure that the 'log_connections' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
  // Default: 'off'
  const logConnections = getFlagValue(instance, 'log_connections', 'off');

  // 6.2.3 Ensure that the 'log_disconnections' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
  // Default: 'off'
  const logDisconnections = getFlagValue(instance, 'log_disconnections', 'off');

  // 6.2.4 Ensure that the 'log_lock_waits' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
  // Default: 'off'
  const logLockWaits = getFlagValue(instance, 'log_lock_waits', 'off');

  // 6.2.5 Ensure that the 'log_min_messages' database flag for Cloud SQL PostgreSQL instance is set appropriately (Not Scored)
  // Default: 'ERROR'
  const logMinErrorStatement = getFlagValue(
    instance,
    'log_min_error_statement',
    'error',
  );

  // 6.2.6 Ensure that the 'log_temp_files' database flag for Cloud SQL PostgreSQL instance is set to '0' (on) (Scored)
  // Default: '0'
  const logTempFiles = getFlagValue(instance, 'log_temp_files', '0');

  // 6.2.7 Ensure that the 'log_min_duration_statement' database flag for Cloud SQL PostgreSQL instance is set to '-1' (disabled) (Scored)
  // Default: '-1'
  const logMinDurationStatement = getFlagValue(
    instance,
    'log_min_duration_statement',
    '-1',
  );

  return {
    logCheckpoints,
    logConnections,
    logDisconnections,
    logLockWaits,
    logMinErrorStatement,
    logTempFiles,
    logMinDurationStatement,
  };
}

function getSQLServerSpecificBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  // 6.3.1 Ensure that the 'cross db ownership chaining' database flag for Cloud SQL SQL Server instance is set to 'off' (Scored)
  // Default: 'off'
  const crossDatabaseOwnershipChaining = getFlagValue(
    instance,
    'cross db ownership chaining',
    'off',
  );

  // 6.3.2 Ensure that the 'contained database authentication' database flag for Cloud SQL on the SQL Server instance is set to 'off' (Scored)
  // Default: 'off'
  const containedDatabaseAuthentication = getFlagValue(
    instance,
    'contained database authentication',
    'off',
  );

  return {
    crossDatabaseOwnershipChaining,
    containedDatabaseAuthentication,
  };
}

function checkPublicIP(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
): boolean {
  // Check to see if the instance type is eligible for this type of check
  if (
    instance.instanceType !== 'CLOUD_SQL_INSTANCE' ||
    instance.backendType !== 'SECOND_GEN'
  ) {
    return false;
  }

  const ipAddresses = instance.ipAddresses || [];
  return ipAddresses.find((ipAddress) => ipAddress.type === 'PRIMARY')
    ? true
    : false;
}

function getCommonBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  // 6.5 Ensure that Cloud SQL database instances are not open to the world (Scored)
  // Default: []
  const authorizedNetworksInfo =
    instance.settings?.ipConfiguration?.authorizedNetworks || [];
  const authorizedNetworks = authorizedNetworksInfo.map(
    (network: any) => network.value,
  );

  // 6.4 Ensure that the Cloud SQL database instance requires all incoming connections to use SSL (Scored)
  // Default: false
  const requireSSL = instance.settings?.ipConfiguration?.requireSsl || false;

  // 6.6 Ensure that Cloud SQL database instances do not have public IPs (Scored)
  // Default: false
  const hasPublicIP = checkPublicIP(instance);

  // 6.7 Ensure that Cloud SQL database instances are configured with automated backups (Scored)
  // Default: true
  const automatedBackupsEnabled =
    instance.settings?.backupConfiguration?.enabled || true;

  return {
    requireSSL,
    authorizedNetworks,
    hasPublicIP,
    automatedBackupsEnabled,
  };
}

export function createCloudMySQLInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createIntegrationEntity({
    entityData: {
      source: instance,
      assign: {
        _key: instance.connectionName as string,
        _type: CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
        _class: CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        type: 'MySQL',
        location: instance.connectionName,
        ...getMySQLSpecificBenchmarkProperties(instance),
        ...getCommonBenchmarkProperties(instance),
      },
    },
  });
}

export function createCloudPostgresInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createIntegrationEntity({
    entityData: {
      source: instance,
      assign: {
        _key: instance.connectionName as string,
        _type: CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
        _class: CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        type: 'Postgres',
        location: instance.connectionName,
        ...getPostgresSpecificBenchmarkProperties(instance),
        ...getCommonBenchmarkProperties(instance),
      },
    },
  });
}

export function createCloudSQLServerInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createIntegrationEntity({
    entityData: {
      source: instance,
      assign: {
        _key: instance.connectionName as string,
        _type: CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
        _class: CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        type: 'SQLServer',
        location: instance.connectionName,
        ...getSQLServerSpecificBenchmarkProperties(instance),
        ...getCommonBenchmarkProperties(instance),
      },
    },
  });
}
