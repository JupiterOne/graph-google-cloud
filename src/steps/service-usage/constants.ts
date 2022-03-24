import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { PROJECT_ENTITY_TYPE } from '../resource-manager/constants';

export const ServiceUsageStepIds = {
  FETCH_API_SERVICES: 'fetch-api-services',
};

export const ServiceUsageEntities = {
  API_SERVICE: {
    _class: ['Service'],
    _type: 'google_cloud_api_service',
    resourceName: 'Cloud API Service',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'google_cloud_api_service' },
        category: { const: ['infrastructure'] },
        state: {
          type: 'string',
          enum: ['STATE_UNSPECIFIED', 'DISABLED', 'ENABLED'],
        },
        enabled: { type: 'boolean' },
        usageRequirements: {
          type: 'array',
          items: { type: 'string' },
        },
        hasIamPermissions: { type: 'boolean' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
        auditable: { type: 'boolean' },
      },
    },
  },
};

export const ServiceUsageRelationships = {
  PROJECT_HAS_API_SERVICE: {
    _type: 'google_cloud_project_has_api_service',
    sourceType: PROJECT_ENTITY_TYPE,
    _class: RelationshipClass.HAS,
    targetType: ServiceUsageEntities.API_SERVICE._type,
  },
};
