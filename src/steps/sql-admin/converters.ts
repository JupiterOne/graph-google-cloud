import { sqladmin_v1beta4 } from 'googleapis';
import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
} from './constants';

function getFlagValue(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
  name: string,
) {
  const databaseFlags = instance.settings?.databaseFlags || [];

  const targetFlag = databaseFlags.find((flag) => flag.name === name);
  return targetFlag?.value;
}

function getMySQLSpecificBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return {
    // 6.1.2 Ensure that the 'local_infile' database flag for a Cloud SQL Mysql instance is set to 'off' (Scored)
    localInfile: getFlagValue(instance, 'local_infile'),
  };
}

function getPostgresSpecificBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return {
    // 6.2.1 Ensure that the 'log_checkpoints' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
    logCheckpoints: getFlagValue(instance, 'log_checkpoints'),
    // 6.2.2 Ensure that the 'log_connections' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
    logConnections: getFlagValue(instance, 'log_connections'),
    // 6.2.3 Ensure that the 'log_disconnections' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
    logDisconnections: getFlagValue(instance, 'log_disconnections'),
    // 6.2.4 Ensure that the 'log_lock_waits' database flag for Cloud SQL PostgreSQL instance is set to 'on' (Scored)
    logLockWaits: getFlagValue(instance, 'log_lock_waits'),
    // 6.2.5 Ensure that the 'log_min_messages' database flag for Cloud SQL PostgreSQL instance is set appropriately (Not Scored)
    logMinErrorStatement: getFlagValue(instance, 'log_min_error_statement'),
    // 6.2.6 Ensure that the 'log_temp_files' database flag for Cloud SQL PostgreSQL instance is set to '0' (on) (Scored)
    logTempFiles: getFlagValue(instance, 'log_temp_files'),
    // 6.2.7 Ensure that the 'log_min_duration_statement' database flag for Cloud SQL PostgreSQL instance is set to '-1' (disabled) (Scored)
    logMinDurationStatement: getFlagValue(
      instance,
      'log_min_duration_statement',
    ),
  };
}

function getSQLServerSpecificBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return {
    // 6.3.1 Ensure that the 'cross db ownership chaining' database flag for Cloud SQL SQL Server instance is set to 'off' (Scored)
    crossDatabaseOwnershipChaining: getFlagValue(
      instance,
      'cross db ownership chaining',
    ),
    // 6.3.2 Ensure that the 'contained database authentication' database flag for Cloud SQL on the SQL Server instance is set to 'off' (Scored)
    containedDatabaseAuthentication: getFlagValue(
      instance,
      'contained database authentication',
    ),
  };
}

function hasPublicIP(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
): boolean | undefined {
  // Check to see if the instance type is eligible for this type of check
  if (
    instance.instanceType !== 'CLOUD_SQL_INSTANCE' ||
    instance.backendType !== 'SECOND_GEN'
  ) {
    return undefined;
  }

  const ipAddresses = instance.ipAddresses || [];
  return (
    ipAddresses.find((ipAddress) => ipAddress.type === 'PRIMARY') !== undefined
  );
}

function getCommonBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  const authorizedNetworksInfo: sqladmin_v1beta4.Schema$AclEntry[] =
    instance.settings?.ipConfiguration?.authorizedNetworks || [];

  const authorizedNetworks: string[] = authorizedNetworksInfo
    .map((network: sqladmin_v1beta4.Schema$AclEntry) => network.value || '')
    .filter((value) => value);

  return {
    // 6.4 Ensure that the Cloud SQL database instance requires all incoming connections to use SSL (Scored)
    requireSSL: instance.settings?.ipConfiguration?.requireSsl,
    // 6.5 Ensure that Cloud SQL database instances are not open to the world (Scored)
    authorizedNetworks: authorizedNetworks,
    // 6.6 Ensure that Cloud SQL database instances do not have public IPs (Scored)
    hasPublicIP: hasPublicIP(instance),
    // 6.7 Ensure that Cloud SQL database instances are configured with automated backups (Scored)
    automatedBackupsEnabled: instance.settings?.backupConfiguration?.enabled,
  };
}

export function createMySQLInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createIntegrationEntity({
    entityData: {
      source: instance,
      assign: {
        _key: instance.connectionName as string,
        _type: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        encrypted: true,
        location: instance.connectionName,
        ...getMySQLSpecificBenchmarkProperties(instance),
        ...getCommonBenchmarkProperties(instance),
      },
    },
  });
}

export function createPostgresInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createIntegrationEntity({
    entityData: {
      source: instance,
      assign: {
        _key: instance.connectionName as string,
        _type: SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        encrypted: true,
        location: instance.connectionName,
        ...getPostgresSpecificBenchmarkProperties(instance),
        ...getCommonBenchmarkProperties(instance),
      },
    },
  });
}

export function createSQLServerInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createIntegrationEntity({
    entityData: {
      source: instance,
      assign: {
        _key: instance.connectionName as string,
        _type: SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        encrypted: true,
        location: instance.connectionName,
        ...getSQLServerSpecificBenchmarkProperties(instance),
        ...getCommonBenchmarkProperties(instance),
      },
    },
  });
}
