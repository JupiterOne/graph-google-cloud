import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { monitoring_v3 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  MONITORING_ALERT_POLICY_CLASS,
  MONITORING_ALERT_POLICY_TYPE,
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
          `/monitoring/alerting/policies/${data.name?.split(
            '/',
          )[3]}?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.creationRecord?.mutateTime),
        updatedOn: parseTimePropertyValue(data.mutationRecord?.mutateTime),
      },
    },
  });
}
