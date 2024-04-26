import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { redis_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_TYPE_REDIS_INSTANCE,
  ENTITY_CLASS_REDIS_INSTANCE,
  ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION,
  ENTITY_CLASS_MEMORYSTORE_REDIS_LOCATION,
  ENTITY_TYPE_MEMORYSTORE_REDIS,
  ENTITY_CLASS_MEMORYSTORE_REDIS,
} from './constants';

export function getRedisKey(uid: string) {
  return `redis:${uid}`;
}

export function createRedisInstanceEntity(
  data: redis_v1.Schema$Instance,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: getRedisKey(data.name!),
        _type: ENTITY_TYPE_REDIS_INSTANCE,
        _class: ENTITY_CLASS_REDIS_INSTANCE,
        name: data.name,
        displayName: data.displayName as string,
        redisVersion: data.redisVersion,
        hostname: data.host,
        port: data.port,
        reservedIpRange: data.reservedIpRange,
        state: data.state,
        tier: data.tier,
        memorySizeGb: data.memorySizeGb,
        connectMode: data.connectMode,
        // For easier/better querying
        transitEncryptionModeEnabled:
          data.transitEncryptionMode?.toUpperCase() !== 'DISABLED',
        statusMessage: data.statusMessage,
        encrypted: null,
        classification: null,
        authEnabled: data.authEnabled === true,
        alternativeLocationId: data.alternativeLocationId,
        currentLocationId: data.currentLocationId,
        locationId: data.locationId,
        createdOn: parseTimePropertyValue(data.createTime),
        webLink: getGoogleCloudConsoleWebLink(
          `/memorystore/redis/locations/${data.name?.split(
            '/',
          )[3]}/instances/${data.name?.split(
            '/',
          )[5]}/details?project=${projectId}`,
        ),
      },
    },
  });
}

export function createMemoryStoreRedisLocationEntity(
  data: redis_v1.Schema$Location,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: getRedisKey(data.name!),
        _type: ENTITY_TYPE_MEMORYSTORE_REDIS_LOCATION,
        _class: ENTITY_CLASS_MEMORYSTORE_REDIS_LOCATION,
        name: data.name,
        displayName: data.displayName as string,
        locationId: data.locationId,
      },
    },
  });
}

export function createMemoryStoreRedisEntity(
  data: any,
  organizationId: string,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: (organizationId + '_' + ENTITY_TYPE_MEMORYSTORE_REDIS) as string,
        _type: ENTITY_TYPE_MEMORYSTORE_REDIS,
        _class: ENTITY_CLASS_MEMORYSTORE_REDIS,
        name: 'MemoryStore Redis Service',
        function: ['Storage'],
        category: ['Platform'],
        endpoint: 'https://console.cloud.google.com/',
      },
    },
  });
}
