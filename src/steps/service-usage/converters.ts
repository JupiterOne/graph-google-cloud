import { serviceusage_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { API_SERVICE_ENTITY_CLASS, API_SERVICE_ENTITY_TYPE } from './constants';

export function createApiServiceEntity({
  data,
  permissions,
}: {
  data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service;
  permissions?: string[];
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
        _key: data.name as string,
        name: config.name,
        displayName: config.title || undefined,
        category: ['infrastructure'],
        description: config.documentation?.summary,
        state: data.state,
        enabled: data.state === 'ENABLED',
        usageRequirements: config.usage?.requirements,
        hasIamPermissions: !!permissions && permissions.length > 0,
      },
    },
  });
}
