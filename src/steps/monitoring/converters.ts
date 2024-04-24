import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { monitoring_v3 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  CLOUD_MONITORING_CLASS,
  CLOUD_MONITORING_TYPE,
  MONITORING_ALERT_POLICY_CLASS,
  MONITORING_ALERT_POLICY_TYPE,
  MONITORING_CHANNEL_CLASS,
  MONITORING_CHANNEL_TYPE,
  MONITORING_GROUP_CLASS,
  MONITORING_GROUP_TYPE,
} from './constants';

export function createAlertPolicyEntity(
  data: monitoring_v3.Schema$AlertPolicy,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: MONITORING_ALERT_POLICY_TYPE,
        _class: MONITORING_ALERT_POLICY_CLASS,
        name: data.displayName,
        displayName: data.displayName as string,
        title: 'Alert policy',
        summary: 'Alert policy that is triggered based on some metric',
        content: '',
        conditionFilters: data.conditions?.map(
          (condition) => condition.conditionThreshold?.filter as string,
        ),
        // 2.4 Ensure log metric filter and alerts exist for project ownership assignments/changes (Scored)
        enabled: data.enabled,
        webLink: getGoogleCloudConsoleWebLink(
          `/monitoring/alerting/policies/${
            data.name?.split('/')[3]
          }?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.creationRecord?.mutateTime),
        updatedOn: parseTimePropertyValue(data.mutationRecord?.mutateTime),
      },
    },
  });
}

export function createGroupEntity(
  data: monitoring_v3.Schema$Group,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: MONITORING_GROUP_TYPE,
        _class: MONITORING_GROUP_CLASS,
        name: data.name,
        displayName: data.displayName as string,
        parentName: data.parentName,
        isCluster: data.isCluster,
        filter: data.filter,
      },
    },
  });
}

export function createChannelEntity(
  data: monitoring_v3.Schema$NotificationChannel,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: MONITORING_CHANNEL_TYPE,
        _class: MONITORING_CHANNEL_CLASS,
        name: data.name,
        displayName: data.displayName as string,
        description: data.description,
        type: data.type,
        isEnabled: data.enabled,
      },
    },
  });
}

export function createCloudMonitoringEntity(
  organizationId: string,
  data: any,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: (organizationId + '_' + CLOUD_MONITORING_TYPE) as string,
        _type: CLOUD_MONITORING_TYPE,
        _class: CLOUD_MONITORING_CLASS,
        name: 'Cloud Monitoring Service',
        function: ['monitoring'],
        category: ['infrastructure'],
        endpoint: 'http://console.cloud.google.com/',
      },
    },
  });
}
