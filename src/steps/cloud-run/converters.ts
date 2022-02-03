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

export interface MetadataComputedPropertyData {
  filteredProperties: {
    [key: string]: string;
  };
  duplicateProperties: string[];
}

export function getCloudRunServiceKey(
  projectId: string,
  location: string,
  name: string,
) {
  return `projects/${projectId}/locations/${location}/services/${name}`;
}

export function getCloudRunRouteKey(uid: string) {
  return `cloudrun_route:${uid}`;
}

export function getCloudRunConfigurationKey(uid: string) {
  return `cloudrun_configuration:${uid}`;
}

export function createCloudRunServiceEntity(
  data: run_v1.Schema$Service,
  projectId: string,
  key: string,
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
        _key: key,
        name: data.metadata?.name,
        function: ['workload-management'],
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
        _key: getCloudRunRouteKey(data.metadata?.uid as string),
        name: data.metadata?.name,
        displayName: data.metadata?.name as string,
        url: data.status?.url,
        createdOn: parseTimePropertyValue(data.metadata?.creationTimestamp),
      },
    },
  });
}

function getNormalizedKey(keyValue: string): string | null {
  const [, key] = keyValue.split('/');
  if (!key) {
    return null;
  }
  // We want to uppercase the first character (becase 'meta' will be in front of it)
  // e.g. last-Modifier -> Last-Modified
  const modifiedKey = key.charAt(0).toUpperCase() + key.slice(1);

  // Get the camelCase version
  // e.g. LastModified
  const camelCase = modifiedKey
    .split('-')
    .reduce((a, b) => a + b.charAt(0).toUpperCase() + b.slice(1));

  // e.g metaLastModified
  return `meta${camelCase}`;
}

function parseMetadata(
  data: Partial<run_v1.Schema$Configuration>,
): MetadataComputedPropertyData {
  const combinedProperties: { [key: string]: string } = {};
  const duplicateProperties: string[] = [];
  const filteredProperties: {
    [key: string]: string;
  } = {};

  if (data.metadata?.annotations) {
    for (const [key, value] of Object.entries(data.metadata.annotations)) {
      if (combinedProperties[key]) {
        duplicateProperties.push(key);
        continue;
      }

      combinedProperties[key] = value;
    }
  }

  if (data.spec?.template?.metadata?.annotations) {
    for (const [key, value] of Object.entries(
      data.spec.template.metadata.annotations,
    )) {
      if (combinedProperties[key]) {
        duplicateProperties.push(key);
        continue;
      }

      combinedProperties[key] = value;
    }
  }

  for (const [key, value] of Object.entries(combinedProperties)) {
    const normalizedKey = getNormalizedKey(key);

    if (!normalizedKey || filteredProperties[normalizedKey]) {
      continue;
    }

    filteredProperties[normalizedKey] = value;
  }

  return {
    filteredProperties,
    duplicateProperties,
  };
}

export function createCloudRunConfigurationEntity(
  data: run_v1.Schema$Configuration,
  options?: {
    onMetadataPropertiesComputed?: (
      computedProperties: MetadataComputedPropertyData,
    ) => void;
  },
) {
  const metadataProperties = parseMetadata(data);

  if (options?.onMetadataPropertiesComputed) {
    options.onMetadataPropertiesComputed(metadataProperties);
  }

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_CLOUD_RUN_CONFIGURATION,
        _type: ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
        _key: getCloudRunConfigurationKey(data.metadata?.uid as string),
        name: data.metadata?.name,
        displayName: data.metadata?.name as string,
        apiVersion: data.apiVersion,
        ...metadataProperties.filteredProperties,
        createdOn: parseTimePropertyValue(data.metadata?.creationTimestamp),
      },
    },
  });
}
