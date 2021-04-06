import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { spanner_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_SPANNER_INSTANCE,
  ENTITY_CLASS_SPANNER_INSTANCE_CONFIG,
  ENTITY_CLASS_SPANNER_INSTANCE_DATABASE,
  ENTITY_TYPE_SPANNER_INSTANCE,
  ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
  ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
} from './constants';

export function createSpannerInstanceEntity({
  data,
  projectId,
  isPublic,
}: {
  data: spanner_v1.Schema$Instance;
  projectId: string;
  isPublic: boolean;
}) {
  const instanceId = data.name?.split('/')[3];

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_SPANNER_INSTANCE,
        _type: ENTITY_TYPE_SPANNER_INSTANCE,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        nodeCount: data.nodeCount,
        state: data.state,
        public: isPublic,
        webLink: getGoogleCloudConsoleWebLink(
          `/spanner/instances/${instanceId}/details/databases?project=${projectId}`,
        ),
      },
    },
  });
}

export function createSpannerInstanceDatabaseEntity({
  data,
  projectId,
  isPublic,
}: {
  data: spanner_v1.Schema$Database;
  projectId: string;
  isPublic: boolean;
}) {
  const instanceId = data.name?.split('/')[3];
  const databaseId = data.name?.split('/')[5];

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_SPANNER_INSTANCE_DATABASE,
        _type: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        state: data.state,
        versionRetentionPeriod: data.versionRetentionPeriod,
        earliestVersionTime: parseTimePropertyValue(data.earliestVersionTime),
        public: isPublic,
        'restoreInfo.sourceType': data.restoreInfo?.sourceType,
        'restoreInfo.backup': data.restoreInfo?.backupInfo?.backup,
        'restoreInfo.versionTime': parseTimePropertyValue(
          data.restoreInfo?.backupInfo?.versionTime,
        ),
        'restoreInfo.createTime': parseTimePropertyValue(
          data.restoreInfo?.backupInfo?.createTime,
        ),
        'restoreInfo.sourceDatabase':
          data.restoreInfo?.backupInfo?.sourceDatabase,
        createdOn: parseTimePropertyValue(data.createTime),
        webLink: getGoogleCloudConsoleWebLink(
          `/spanner/instances/${instanceId}/databases/${databaseId}/details/tables?project=${projectId}`,
        ),
      },
    },
  });
}

export function createSpannerInstanceConfiguration(
  data: spanner_v1.Schema$InstanceConfig,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_SPANNER_INSTANCE_CONFIG,
        _type: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
      },
    },
  });
}
