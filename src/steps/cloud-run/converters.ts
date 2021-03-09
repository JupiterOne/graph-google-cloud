import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { run_v1 } from 'googleapis';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_CLOUD_RUN_SERVICE,
  ENTITY_TYPE_CLOUD_RUN_SERVICE,
  ENTITY_TYPE_CLOUD_RUN_ROUTE,
  ENTITY_CLASS_CLOUD_RUN_ROUTE,
  ENTITY_CLASS_CLOUD_RUN_CONFIGURATION,
  ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
} from './constants';

export function createCloudRunServiceEntity(
  data: run_v1.Schema$Service,
  projectId: string,
) {
  // Build webLink
  let webLink = '';
  if (
    data.metadata?.labels &&
    data.metadata?.labels['cloud.googleapis.com/location']
  ) {
    webLink = `/run/detail/${data.metadata?.labels['cloud.googleapis.com/location']}/${data.metadata.name}`;
  } else {
    // Worst case we lead the user to "view all services" page
    webLink = `/run?project=${projectId}`;
  }

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_RUN_SERVICE,
        _type: ENTITY_TYPE_CLOUD_RUN_SERVICE,
        _key: data.metadata?.selfLink as string,
        name: data.metadata?.name,
        displayName: data.metadata?.name as string,
        category: ['infrastructure'],
        createdOn: parseTimePropertyValue(data.metadata?.creationTimestamp),
        webLink: getGoogleCloudConsoleWebLink(webLink),
      },
    },
  });
}

export function createCloudRunRouteEntity(data: run_v1.Schema$Route) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_RUN_ROUTE,
        _type: ENTITY_TYPE_CLOUD_RUN_ROUTE,
        _key: data.metadata?.selfLink as string,
        name: data.metadata?.name,
        displayName: data.metadata?.name as string,
        url: data.status?.url,
        createdOn: parseTimePropertyValue(data.metadata?.creationTimestamp),
      },
    },
  });
}

export function createCloudRunConfigurationEntity(
  data: run_v1.Schema$Configuration,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_RUN_CONFIGURATION,
        _type: ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
        _key: data.metadata?.selfLink as string,
        name: data.metadata?.name,
        displayName: data.metadata?.name as string,
        createdOn: parseTimePropertyValue(data.metadata?.creationTimestamp),
      },
    },
  });
}
