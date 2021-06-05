import { accesscontextmanager_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
  ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
} from './constants';

export function createAccessPolicyEntity(
  data: accesscontextmanager_v1.Schema$AccessPolicy,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
        name: data.name,
        title: data.title,
        etag: data.etag,
      },
    },
  });
}

export function createAccessLevelEntity(
  data: accesscontextmanager_v1.Schema$AccessLevel,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL,
        name: data.name,
        description: data.description,
        title: data.title,
      },
    },
  });
}

export function createServicePerimeterEntity(
  data: accesscontextmanager_v1.Schema$ServicePerimeter,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        _class: ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER,
        name: data.name,
        description: data.description,
        perimeterType: data.perimeterType,
        title: data.title,
        useExplicitDryRunSpec: data.useExplicitDryRunSpec,
        // shared fields between .spec/.status depending on the run mode
        accessLevels: data.status?.accessLevels,
        resources: data.status?.resources,
        restrictedServices: data.status?.restrictedServices,
        // ingressPolicies
        // egressPolicies
      },
    },
  });
}
