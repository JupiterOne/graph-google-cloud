import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { sqladmin_v1 } from 'googleapis';
import {
  ENTITY_CLASS_CLOUD_SQL,
  ENTITY_TYPE_CLOUD_SQL,
  ENTITY_CLASS_CLOUD_SQL_INSTANCES,
  ENTITY_TYPE_CLOUD_SQL_INSTANCES,
  ENTITY_CLASS_CLOUD_SQL_SSL_CERTIFICATION,
  ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
  ENTITY_TYPE_CLOUD_SQL_BACKUP,
  ENTITY_CLASS_CLOUD_SQL_BACKUP,
  ENTITY_CLASS_CLOUD_SQL_CONNECTION,
  ENTITY_TYPE_CLOUD_SQL_CONNECTION,
  ENTITY_CLASS_CLOUD_SQL_DATABASE,
  ENTITY_TYPE_CLOUD_SQL_DATABASE,
  ENTITY_CLASS_CLOUD_USER,
  ENTITY_TYPE_CLOUD_USER,
} from './constants';

export function createCloudSqlServiceEntity(projectId: string) {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _class: ENTITY_CLASS_CLOUD_SQL,
        _type: ENTITY_TYPE_CLOUD_SQL,
        _key: projectId,
        name: 'Cloud Sql Service',
        function: ['database', 'storage'],
        category: ['infrastructure'],
      },
    },
  });
}

export function createCloudSqlInstancesEntity(data) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_SQL_INSTANCES,
        _type: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        _key: data.name as string,
        name: data.name,
        etag: data.etag,
        connectionName: data.connectionName,
        url: data.selfLink,
        projectId: data.projectId,
        kind: data.kind,
        databaseInstalledVersion: data.databaseInstalledVersion,
      },
    },
  });
}

export function createCloudSslCertificationEntity(
  data: sqladmin_v1.Schema$SslCert,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_SQL_SSL_CERTIFICATION,
        _type: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
        _key: ('cert_key:' + data.certSerialNumber) as string,
        name: data.commonName,
        instanceName: data.instance,
        url: data.selfLink,
        cert: data.cert,
        kind: data.kind,
        certSerialNumber: data.certSerialNumber,
        sha1FingerPrint: data.sha1Fingerprint,
        expirationTime: data.expirationTime,
        createTime: data.createTime,
      },
    },
  });
}

export function createCloudSqlBackupEntity(data: sqladmin_v1.Schema$BackupRun) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_SQL_BACKUP,
        _type: ENTITY_TYPE_CLOUD_SQL_BACKUP,
        _key: data.id as string,
        name: data.kind,
        instanceName: data.instance,
        url: data.selfLink,
        status: data.status,
        type: data.type,
        description: data.description,
        backupKind: data.backupKind,
        location: data.location,
        enqueuedTime: data.enqueuedTime,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    },
  });
}

export function createCloudSqlConnectionEntity(
  data: sqladmin_v1.Schema$ConnectSettings,
) {
  // Function to extract IP addresses from ipAddresses array
  function extractIPAddresses(
    ipAddresses: sqladmin_v1.Schema$IpMapping[] | undefined,
  ): string | undefined {
    if (!ipAddresses) return undefined;
    return ipAddresses.map((addr) => addr.ipAddress).join(',');
  }

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_SQL_CONNECTION,
        _type: ENTITY_TYPE_CLOUD_SQL_CONNECTION,
        _key: ('SqlConnection_' +
          data.serverCaCert?.certSerialNumber) as string,
        name: data.serverCaCert?.commonName,
        instanceName: data.serverCaCert?.instance,
        databaseVersion: data.databaseVersion,
        backendType: data.backendType,
        kind: data.kind,
        CIDR: extractIPAddresses(data.ipAddresses),
        public: true,
        internal: false,
        pscEnabled: data.pscEnabled,
        dnsName: data.dnsName,
      },
    },
  });
}

export function createCloudSqlDatabaseEntity(
  data: sqladmin_v1.Schema$Database,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_SQL_DATABASE,
        _type: ENTITY_TYPE_CLOUD_SQL_DATABASE,
        _key: data.etag as string,
        name: data.name,
        kind: data.kind,
        instanceName: data.instance,
        url: data.selfLink,
        projectId: data.project,
        charset: data.charset,
      },
    },
  });
}

export function createCloudUserEntity(data: sqladmin_v1.Schema$User) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_USER,
        _type: ENTITY_TYPE_CLOUD_USER,
        _key: data.etag as string,
        name: data.name,
        instanceName: data.instance,
        projectId: data.project,
      },
    },
  });
}
