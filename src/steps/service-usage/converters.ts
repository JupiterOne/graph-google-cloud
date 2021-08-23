import { serviceusage_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { API_SERVICE_ENTITY_CLASS, API_SERVICE_ENTITY_TYPE } from './constants';

export function getServiceApiEntityKey({
  projectId,
  serviceApiName,
}: {
  projectId: string;
  /**
   * Example: serviceusage.googleapis.com
   */
  serviceApiName: string;
}) {
  return `projects/${projectId}/services/${serviceApiName}`;
}

export function createApiServiceEntity({
  projectId,
  data,
  permissions,
  isAuditable,
}: {
  projectId: string;
  data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service;
  permissions?: string[];
  isAuditable?: boolean;
}) {
  const { config } = data;

  if (!config) {
    throw new Error('API Service missing required "config" in response');
  }

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: API_SERVICE_ENTITY_CLASS,
        _type: API_SERVICE_ENTITY_TYPE,
        _key: getServiceApiEntityKey({
          projectId,
          serviceApiName: config.name as string,
        }),
        name: config.name,
        displayName: config.title || undefined,
        category: ['infrastructure'],
        function: ['api-enablement'],
        description: config.documentation?.summary,
        state: data.state,
        enabled: data.state === 'ENABLED',
        usageRequirements: config.usage?.requirements,
        hasIamPermissions: !!permissions && permissions.length > 0,
        isAuditable,
      },
    },
  });
}
