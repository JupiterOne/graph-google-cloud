import { serviceusage_v1 } from 'googleapis';
import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { API_SERVICE_ENTITY_CLASS, API_SERVICE_ENTITY_TYPE } from './constants';
import { generateEntityKey } from '../../utils/generateKeys';

export function createApiServiceEntity(
  data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
) {
  const { config } = data;

  if (!config) {
    throw new Error('API Service missing required "config" in response');
  }

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: API_SERVICE_ENTITY_CLASS,
        _type: API_SERVICE_ENTITY_TYPE,
        _key: generateEntityKey({
          type: API_SERVICE_ENTITY_TYPE,
          id: data.name as string,
        }),
        name: config.name,
        displayName: config.title || undefined,
        category: ['infrastructure'],
        description: config.documentation?.summary,
        state: data.state,
        enabled: data.state === 'ENABLED',
        usageRequirements: config.usage?.requirements,
      },
    },
  });
}
