import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  GOOGLE_DOMAIN_ENTITY_TYPE,
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
} from '../iam/constants';
import { ServiceUsageEntities } from '../service-usage/constants';

export const ResourceManagerStepIds = {
  FETCH_IAM_POLICY_AUDIT_CONFIG: 'fetch-iam-policy-audit-config',
  FETCH_ORGANIZATION: 'fetch-resource-manager-organization',
  FETCH_FOLDERS: 'fetch-resource-manager-folders',
  FETCH_PROJECT: 'fetch-resource-manager-project',
  BUILD_ORG_PROJECT_RELATIONSHIPS:
    'fetch-resource-manager-org-project-relationships',
};

export const ResourceManagerEntities = {
  ORGANIZATION: {
    _type: 'google_cloud_organization',
    _class: ['Organization'],
    resourceName: 'Organization',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'google_cloud_organization' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
        name: { type: 'string' },
        displayName: { type: 'string' },
        directoryCustomerId: { type: 'string' },
        etag: { type: 'string' },
        lifecycleState: { type: 'string' },
        createdOn: { type: 'number' },
        updatedOn: { type: 'number' },
      },
    },
  },
  FOLDER: {
    _type: 'google_cloud_folder',
    _class: ['Group'],
    resourceName: 'Folder',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'google_cloud_folder' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
        name: { type: 'string' },
        displayName: { type: 'string' },
        etag: { type: 'string' },
        lifecycleState: { type: 'string' },
        parent: { type: 'string' },
        createdOn: { type: 'number' },
        updatedOn: { type: 'number' },
      },
    },
  },
  PROJECT: {
    _type: 'google_cloud_project',
    _class: ['Account'],
    resourceName: 'Project',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'google_cloud_project' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
        projectId: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        parent: { type: 'string' },
        lifecycleState: { type: 'string' },
        createdOn: { type: 'number' },
        updatedOn: { type: 'number' },
      },
    },
  },
  AUDIT_CONFIG: {
    _type: 'google_cloud_audit_config',
    _class: ['Configuration'],
    resourceName: 'Audit Config',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'google_cloud_audit_config' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
        name: { type: 'string' },
        displayName: { type: 'string' },
        service: { type: 'string' },
        logTypes: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

export const ResourceManagerRelationships = {
  ORGANIZATION_HAS_FOLDER: {
    _type: 'google_cloud_organization_has_folder',
    sourceType: ResourceManagerEntities.ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: ResourceManagerEntities.FOLDER._type,
  },
  FOLDER_HAS_FOLDER: {
    _type: 'google_cloud_folder_has_folder',
    sourceType: ResourceManagerEntities.FOLDER._type,
    _class: RelationshipClass.HAS,
    targetType: ResourceManagerEntities.FOLDER._type,
  },
  ORGANIZATION_HAS_PROJECT: {
    _type: 'google_organization_has_project',
    sourceType: ResourceManagerEntities.ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: ResourceManagerEntities.PROJECT._type,
  },
  FOLDER_HAS_PROJECT: {
    _type: 'google_folder_has_project',
    sourceType: ResourceManagerEntities.FOLDER._type,
    _class: RelationshipClass.HAS,
    targetType: ResourceManagerEntities.PROJECT._type,
  },
  API_SERVICE_USES_AUDIT_CONFIG: {
    _type: 'google_cloud_api_service_uses_audit_config',
    sourceType: ServiceUsageEntities.API_SERVICE._type,
    _class: RelationshipClass.USES,
    targetType: ResourceManagerEntities.AUDIT_CONFIG._type,
  },
  AUDIT_CONFIG_ALLOWS_SERVICE_ACCOUNT: {
    _type: 'google_cloud_audit_config_allows_iam_service_account',
    sourceType: ResourceManagerEntities.AUDIT_CONFIG._type,
    _class: RelationshipClass.ALLOWS,
    targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  },
  AUDIT_CONFIG_ALLOWS_USER: {
    _type: 'google_cloud_audit_config_allows_user',
    sourceType: ResourceManagerEntities.AUDIT_CONFIG._type,
    _class: RelationshipClass.ALLOWS,
    targetType: GOOGLE_USER_ENTITY_TYPE,
  },
  AUDIT_CONFIG_ALLOWS_GROUP: {
    _type: 'google_cloud_audit_config_allows_group',
    sourceType: ResourceManagerEntities.AUDIT_CONFIG._type,
    _class: RelationshipClass.ALLOWS,
    targetType: GOOGLE_GROUP_ENTITY_TYPE,
  },
  AUDIT_CONFIG_ALLOWS_DOMAIN: {
    _type: 'google_cloud_audit_config_allows_domain',
    sourceType: ResourceManagerEntities.AUDIT_CONFIG._type,
    _class: RelationshipClass.ALLOWS,
    targetType: GOOGLE_DOMAIN_ENTITY_TYPE,
  },
};
