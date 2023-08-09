import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { memcache_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_MEMCACHE_INSTANCE,
  ENTITY_CLASS_MEMCACHE_INSTANCE_NODE,
  ENTITY_TYPE_MEMCACHE_INSTANCE,
  ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
} from './constants';

export function getMemcacheKey(uid: string) {
  return `memcached:${uid}`;
}

export function createMemcacheInstanceEntity(
  data: memcache_v1.Schema$Instance,
  projectId: string,
) {
  const { memcacheNodes, ...withoutNodes } = data;

  return createGoogleCloudIntegrationEntity(withoutNodes, {
    entityData: {
      source: withoutNodes,
      assign: {
        _key: getMemcacheKey(withoutNodes.name!),
        _type: ENTITY_TYPE_MEMCACHE_INSTANCE,
        _class: ENTITY_CLASS_MEMCACHE_INSTANCE,
        name: withoutNodes.name,
        displayName: withoutNodes.displayName as string,
        nodeCount: withoutNodes.nodeCount,
        nodeCpuCount: withoutNodes.nodeConfig?.cpuCount,
        nodeMemorySizeMb: withoutNodes.nodeConfig?.memorySizeMb,
        memcacheVersion: withoutNodes.memcacheVersion,
        memcacheFullVersion: withoutNodes.memcacheFullVersion,
        state: withoutNodes.state,
        discoveryEndpoint: withoutNodes.discoveryEndpoint,
        encrypted: null,
        classification: null,
        createdOn: parseTimePropertyValue(withoutNodes.createTime),
        updatedOn: parseTimePropertyValue(withoutNodes.updateTime),
        webLink: getGoogleCloudConsoleWebLink(
          `/memorystore/memcached/locations/${data.name?.split(
            '/',
          )[3]}/instances/${data.name?.split(
            '/',
          )[5]}/details?project=${projectId}`,
        ),
        hostname: null,
      },
    },
  });
}

function getMemcacheNodeKey(instanceKey: string, nodeId: string): string {
  return `${instanceKey}/${nodeId}`;
}

export function createMemcacheNodeEntity(
  data: memcache_v1.Schema$Node,
  instanceKey: string,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        /*
          Memcache nodes have ids (e.g. "nodeId": "node-c-1",)
          But to be safer that there's no collision we can use the instance's key (e.g. its selfLink or fullPath) and add node's id on it

          Instance key:
          projects/j1-gc-integration-dev-v2/locations/us-central1/instances/test-memcached-instance

          Node id:
          node-c-1

          New node's key:
          projects/j1-gc-integration-dev-v2/locations/us-central1/instances/test-memcached-instance/node-c-1

          This also works nicely in giving us ability to create webLink here. There's tab "Nodes" once you use this webLink.
        */
        _key: getMemcacheNodeKey(instanceKey, data.nodeId as string),
        _type: ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
        _class: ENTITY_CLASS_MEMCACHE_INSTANCE_NODE,
        name: data.nodeId,
        displayName: data.nodeId as string,
        zone: data.zone,
        state: data.state,
        host: data.host,
        port: data.port,
        classification: null,
        encrypted: null,
        webLink: getGoogleCloudConsoleWebLink(
          `/memorystore/memcached/locations/${
            instanceKey.split('/')[3]
          }/instances/${
            instanceKey.split('/')[5]
          }/details?project=${projectId}`,
        ),
        hostname: null,
      },
    },
  });
}
