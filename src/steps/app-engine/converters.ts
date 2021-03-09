import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { appengine_v1 } from 'googleapis';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_APP_ENGINE_APPLICATION,
  ENTITY_CLASS_APP_ENGINE_INSTANCE,
  ENTITY_CLASS_APP_ENGINE_SERVICE,
  ENTITY_CLASS_APP_ENGINE_VERSION,
  ENTITY_TYPE_APP_ENGINE_APPLICATION,
  ENTITY_TYPE_APP_ENGINE_INSTANCE,
  ENTITY_TYPE_APP_ENGINE_SERVICE,
  ENTITY_TYPE_APP_ENGINE_VERSION,
} from './constants';

export function createAppEngineApplicationEntity(
  data: appengine_v1.Schema$Application,
  projectId: string,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_APPLICATION,
        _type: ENTITY_TYPE_APP_ENGINE_APPLICATION,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        location: data.locationId,
        servingStatus: data.servingStatus,
        defaultHostname: data.defaultHostname,
        defaultBucket: data.defaultBucket,
        splitHealthChecks: data.featureSettings?.splitHealthChecks,
        useContainerOptimizedOs: data.featureSettings?.useContainerOptimizedOs,
        webLink: getGoogleCloudConsoleWebLink(
          `/appengine?project=${projectId}`,
        ),
      },
    },
  });
}

export function createAppEngineServiceEntity(
  data: appengine_v1.Schema$Service,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_SERVICE,
        _type: ENTITY_TYPE_APP_ENGINE_SERVICE,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
      },
    },
  });
}

export function createAppEngineVersionEntity(
  data: appengine_v1.Schema$Version,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_VERSION,
        _type: ENTITY_TYPE_APP_ENGINE_VERSION,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        versionUrl: data.versionUrl,
        category: ['application'],
        createdOn: parseTimePropertyValue(data.createTime),
      },
    },
  });
}

export function createAppEngineInstanceEntity(
  data: appengine_v1.Schema$Instance,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_APP_ENGINE_INSTANCE,
        _type: ENTITY_TYPE_APP_ENGINE_INSTANCE,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        availability: data.availability,
        requests: data.requests,
        createdOn: parseTimePropertyValue(data.startTime),
      },
    },
  });
}
