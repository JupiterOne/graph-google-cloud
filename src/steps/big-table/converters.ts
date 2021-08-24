import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { bigtableadmin_v2 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink, getLastUrlPart } from '../../utils/url';
import {
  ENTITY_CLASS_BIG_TABLE_APP_PROFILE,
  ENTITY_CLASS_BIG_TABLE_BACKUP,
  ENTITY_CLASS_BIG_TABLE_CLUSTER,
  ENTITY_CLASS_BIG_TABLE_INSTANCE,
  ENTITY_CLASS_BIG_TABLE_TABLE,
  ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
  ENTITY_TYPE_BIG_TABLE_BACKUP,
  ENTITY_TYPE_BIG_TABLE_CLUSTER,
  ENTITY_TYPE_BIG_TABLE_INSTANCE,
  ENTITY_TYPE_BIG_TABLE_TABLE,
} from './constants';

export function createInstanceEntity({
  instance,
  projectId,
}: {
  instance: bigtableadmin_v2.Schema$Instance;
  projectId: string | undefined | null;
}) {
  const instanceName = getLastUrlPart(instance.name!);

  return createGoogleCloudIntegrationEntity(instance, {
    entityData: {
      source: instance,
      assign: {
        _class: ENTITY_CLASS_BIG_TABLE_INSTANCE,
        _type: ENTITY_TYPE_BIG_TABLE_INSTANCE,
        _key: instance.name as string,
        name: instance.name,
        displayName: instance.displayName!,
        active: instance.state === 'READY',
        state: instance.state,
        type: instance.type,
        webLink: getGoogleCloudConsoleWebLink(
          `/bigtable/instances/${instanceName}/overview?project=${projectId}`,
        ),
      },
    },
  });
}

export function createAppProfileEntity({
  appProfile,
  projectId,
  instanceId,
}: {
  appProfile: bigtableadmin_v2.Schema$AppProfile;
  projectId: string | undefined | null;
  instanceId: string | undefined | null;
}) {
  const instanceName = getLastUrlPart(instanceId!);
  const appProfileName = getLastUrlPart(appProfile.name!);

  return createGoogleCloudIntegrationEntity(appProfile, {
    entityData: {
      source: appProfile,
      assign: {
        _class: ENTITY_CLASS_BIG_TABLE_APP_PROFILE,
        _type: ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
        _key: appProfile.name as string,
        name: appProfile.name,
        instanceId,
        etag: appProfile.etag,
        description: appProfile.description,
        'singleClusterRouting.allowTransactionalWrites':
          appProfile.singleClusterRouting?.allowTransactionalWrites,
        'singleClusterRouting.clusterId':
          appProfile.singleClusterRouting?.clusterId,

        webLink: getGoogleCloudConsoleWebLink(
          `/bigtable/instances/${instanceName}/app-profiles/${appProfileName}?project=${projectId}`,
        ),
      },
    },
  });
}

export function createClusterEntity({
  cluster,
  projectId,
  instanceId,
}: {
  cluster: bigtableadmin_v2.Schema$Cluster;
  projectId: string | undefined | null;
  instanceId: string | undefined | null;
}) {
  const instanceName = getLastUrlPart(instanceId!);

  return createGoogleCloudIntegrationEntity(cluster, {
    entityData: {
      source: cluster,
      assign: {
        _class: ENTITY_CLASS_BIG_TABLE_CLUSTER,
        _type: ENTITY_TYPE_BIG_TABLE_CLUSTER,
        _key: cluster.name as string,
        name: cluster.name,
        instanceId,
        state: cluster.state,
        active: cluster.state === 'READY',
        serveNodes: cluster.serveNodes,
        defaultStorageType: cluster.defaultStorageType,
        location: cluster.location,
        kmsKeyName: cluster.encryptionConfig?.kmsKeyName,
        webLink: getGoogleCloudConsoleWebLink(
          `/bigtable/instances/${instanceName}/overview?project=${projectId}`,
        ),
      },
    },
  });
}

export function createBackupEntity({
  backup,
  projectId,
  instanceId,
  clusterId,
}: {
  backup: bigtableadmin_v2.Schema$Backup;
  projectId: string | undefined | null;
  instanceId: string | undefined | null;
  clusterId: string | undefined | null;
}) {
  const instanceName = getLastUrlPart(instanceId!);

  return createGoogleCloudIntegrationEntity(backup, {
    entityData: {
      source: backup,
      assign: {
        _class: ENTITY_CLASS_BIG_TABLE_BACKUP,
        _type: ENTITY_TYPE_BIG_TABLE_BACKUP,
        _key: backup.name as string,
        name: backup.name,
        instanceId,
        clusterId,
        sourceTable: backup.sourceTable,
        expireTime: parseTimePropertyValue(backup.expireTime),
        startTime: parseTimePropertyValue(backup.startTime),
        endTime: parseTimePropertyValue(backup.endTime),
        sizeBytes: backup.sizeBytes,
        state: backup.state,
        active: backup.state === 'READY',
        encryptionType: backup.encryptionInfo?.encryptionType,
        kmsKeyVersion: backup.encryptionInfo?.kmsKeyVersion,
        webLink: getGoogleCloudConsoleWebLink(
          `/bigtable/instances/${instanceName}/backups?project=${projectId}`,
        ),
      },
    },
  });
}

export function createTableEntity({
  table,
  projectId,
  instanceId,
}: {
  table: bigtableadmin_v2.Schema$Table;
  projectId: string | undefined | null;
  instanceId: string | undefined | null;
}) {
  const instanceName = getLastUrlPart(instanceId!);

  return createGoogleCloudIntegrationEntity(table, {
    entityData: {
      source: table,
      assign: {
        _class: ENTITY_CLASS_BIG_TABLE_TABLE,
        _type: ENTITY_TYPE_BIG_TABLE_TABLE,
        _key: table.name as string,
        name: table.name,
        classification: null,
        instanceId,
        granularity: table.granularity || undefined,
        sourceType: table.restoreInfo?.sourceType || undefined,
        backup: table.restoreInfo?.backupInfo?.backup || undefined,
        webLink: getGoogleCloudConsoleWebLink(
          `/bigtable/instances/${instanceName}/tables?project=${projectId}`,
        ),
      },
    },
  });
}
