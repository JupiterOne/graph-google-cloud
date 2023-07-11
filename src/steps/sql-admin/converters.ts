import { sqladmin_v1beta4 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
} from './constants';
import { mysqlInstanceParser } from './mysqlInstanceParsers';

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
    // (from the new CIS benchmark) 6.1.2 Ensure 'skip_show_database' database flag for Cloud SQL Mysql instance is set to 'on'
    skipShowDatabase: getFlagValue(instance, 'skip_show_database'),
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
    // 6.2.13 Ensure that the 'log_min_messages' database flag for Cloud SQL PostgreSQL instance is set appropriately
    logMinMessages: getFlagValue(instance, 'log_min_messages'),
    // 6.2.14 Ensure 'log_min_error_statement' database flag for Cloud SQL PostgreSQL instance is set to 'Error' or stricter
    logMinErrorStatement: getFlagValue(instance, 'log_min_error_statement'),
    // 6.2.6 Ensure that the 'log_temp_files' database flag for Cloud SQL PostgreSQL instance is set to '0' (on) (Scored)
    logTempFiles: getFlagValue(instance, 'log_temp_files'),
    // 6.2.7 Ensure that the 'log_min_duration_statement' database flag for Cloud SQL PostgreSQL instance is set to '-1' (disabled) (Scored)
    logMinDurationStatement: getFlagValue(
      instance,
      'log_min_duration_statement',
    ),
    // (from the new CIS benchmark) 6.2.5 Ensure 'log_duration' database flag for Cloud SQL PostgreSQL instance is set to 'on'
    logDuration: getFlagValue(instance, 'log_duration'),
    // (from the new CIS benchmark) 6.2.2 Ensure 'log_error_verbosity' database flag for Cloud SQL PostgreSQL instance is set to 'DEFAULT' or stricter
    logErrorVerbosity: getFlagValue(instance, 'log_error_verbosity'),
    // 6.2.7 (v1.2.0) Ensure 'log_statement' database flag for Cloud SQL PostgreSQL instance is set appropriately
    logStatement: getFlagValue(instance, 'log_statement'),
    // 6.2.8 Ensure 'log_hostname' database flag for Cloud SQL PostgreSQL instance is set appropriately
    logHostname: getFlagValue(instance, 'log_hostname'),
    // 6.2.9 Ensure 'log_parser_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off'
    logParserStats: getFlagValue(instance, 'log_parser_stats'),
    // 6.2.10 Ensure 'log_planner_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off'
    logPlannerStats: getFlagValue(instance, 'log_planner_stats'),
    // 6.2.11 Ensure 'log_executor_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off'
    logExecutorStats: getFlagValue(instance, 'log_executor_stats'),
    // 6.2.12 Ensure 'log_statement_stats' database flag for Cloud SQL PostgreSQL instance is set to 'off'
    logStatementStats: getFlagValue(instance, 'log_statement_stats'),
  };
}

function getSQLServerSpecificBenchmarkProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  const userConnections = getFlagValue(instance, 'user connections');
  const userOptions = getFlagValue(instance, 'user options');

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
    // (acc. to new benchmark) 6.3.1 Ensure 'external scripts enabled' database flag for Cloud SQL SQL Server instance is set to 'off'
    externalScriptsEnabled: getFlagValue(instance, 'external scripts enabled'),
    // (acc. to new benchmark) 6.3.3 Ensure 'user connections' database flag for Cloud SQL SQL Server instance is set as appropriate
    userConnections: userConnections ? parseInt(userConnections) : undefined,
    // (acc. to new benchmark) 6.3.4 Ensure 'user options' database flag for Cloud SQL SQL Server instance is not configured (Automated)
    userOptions: userOptions ? parseInt(userOptions) : undefined,
    // (acc. to new benchmark) 6.3.5 Ensure 'remote access' database flag for Cloud SQL SQL Server instance is set to 'off'
    remoteAccess: getFlagValue(instance, 'remote access'),
    // (acc. to new benchmark) 6.3.6 Ensure '3625 (trace flag)' database flag for Cloud SQL SQL Server instance is set to 'off'
    traceFlag: getFlagValue(instance, '3625'),
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

function getCommonDatabaseInstanceProperties(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  const authorizedNetworksInfo: sqladmin_v1beta4.Schema$AclEntry[] =
    instance.settings?.ipConfiguration?.authorizedNetworks || [];

  const authorizedNetworks: string[] = authorizedNetworksInfo
    .map((network: sqladmin_v1beta4.Schema$AclEntry) => network.value || '')
    .filter((value) => value);

  const ipAddresses =
    instance.ipAddresses?.filter((e) => typeof e.ipAddress === 'string') || [];
  const primaryIpAddresses =
    ipAddresses.filter((e) => e.type?.toUpperCase() === 'PRIMARY') || [];
  const privateIpAddresses =
    ipAddresses.filter((e) => e.type?.toUpperCase() === 'PRIVATE') || [];
  const outgoingIpAddresses =
    ipAddresses.filter((e) => e.type?.toUpperCase() === 'OUTGOING') || [];

  return {
    // 6.4 Ensure that the Cloud SQL database instance requires all incoming connections to use SSL (Scored)
    requireSSL: instance.settings?.ipConfiguration?.requireSsl,
    // 6.5 Ensure that Cloud SQL database instances are not open to the world (Scored)
    authorizedNetworks: authorizedNetworks,
    // 6.6 Ensure that Cloud SQL database instances do not have public IPs (Scored)
    hasPublicIP: hasPublicIP(instance),

    ipAddresses:
      ipAddresses.length > 0 ? ipAddresses.map((e) => e.ipAddress!) : undefined,
    primaryIpAddresses:
      primaryIpAddresses.length > 0
        ? primaryIpAddresses.map((e) => e.ipAddress!)
        : undefined,
    privateIpAddresses:
      privateIpAddresses.length > 0
        ? privateIpAddresses.map((e) => e.ipAddress!)
        : undefined,
    outgoingIpAddresses:
      outgoingIpAddresses.length > 0
        ? outgoingIpAddresses.map((e) => e.ipAddress!)
        : undefined,

    // 6.7 Ensure that Cloud SQL database instances are configured with automated backups (Scored)
    automatedBackupsEnabled: instance.settings?.backupConfiguration?.enabled,
    connectionName: instance.connectionName,
    kmsKeyName: instance.diskEncryptionConfiguration?.kmsKeyName,
  };
}

export function createMySQLInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createGoogleCloudIntegrationEntity(instance, {
    entityData: {
      source: instance,
      assign: {
        _key: instance.selfLink as string,
        _type: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        encrypted: true,
        location: instance.connectionName,
        hasRootPassword: mysqlInstanceParser.parseHasRootPassword(instance),
        ...getMySQLSpecificBenchmarkProperties(instance),
        ...getCommonDatabaseInstanceProperties(instance),
      },
    },
  });
}

export function createPostgresInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createGoogleCloudIntegrationEntity(instance, {
    entityData: {
      source: instance,
      assign: {
        _key: instance.selfLink as string,
        _type: SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        encrypted: true,
        location: instance.connectionName,
        ...getPostgresSpecificBenchmarkProperties(instance),
        ...getCommonDatabaseInstanceProperties(instance),
      },
    },
  });
}

export function createSQLServerInstanceEntity(
  instance: sqladmin_v1beta4.Schema$DatabaseInstance,
) {
  return createGoogleCloudIntegrationEntity(instance, {
    entityData: {
      source: instance,
      assign: {
        _key: instance.selfLink as string,
        _type: SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
        name: instance.name,
        encrypted: true,
        location: instance.connectionName,
        ...getSQLServerSpecificBenchmarkProperties(instance),
        ...getCommonDatabaseInstanceProperties(instance),
      },
    },
  });
}
