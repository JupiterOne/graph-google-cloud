import { container_v1 } from 'googleapis';
import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import {
  CONTAINER_CLUSTER_ENTITY_CLASS,
  CONTAINER_CLUSTER_ENTITY_TYPE,
} from './constants';

export function createContainerClusterEntity(
  data: container_v1.Schema$Cluster,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.selfLink as string,
        _type: CONTAINER_CLUSTER_ENTITY_TYPE,
        _class: CONTAINER_CLUSTER_ENTITY_CLASS,
        createdOn: parseTimePropertyValue(data.createTime),
        name: data.name,
        description: data.description,
        initialNodeCode: data.initialNodeCount,
        nodeMachineType: data.nodeConfig?.machineType,
        nodeDiskSizeGb: data.nodeConfig?.diskSizeGb,
        nodeOAuthScopes: data.nodeConfig?.oauthScopes,
        nodeImageType: data.nodeConfig?.imageType,
        nodePreemptible: data.nodeConfig?.preemptible,
        nodeDiskType: data.nodeConfig?.diskType,
        nodeEnableIntegrityMonitoring:
          data.nodeConfig?.shieldedInstanceConfig?.enableIntegrityMonitoring,
        nodeEnableSecureBoot:
          data.nodeConfig?.shieldedInstanceConfig?.enableSecureBoot,
        network: data.networkConfig?.network,
        clusterIpv4Cidr: data.clusterIpv4Cidr,
        kubernetesDashboardEnabled:
          data.addonsConfig?.kubernetesDashboard?.disabled !== true,
        networkPolicyConfigEnabled:
          data.addonsConfig?.networkPolicyConfig?.disabled !== true,
        subnetwork: data.networkConfig?.subnetwork,
        locations: data.locations,
        useRoutes: data.ipAllocationPolicy?.useRoutes === true,
        useIpAliases: data.ipAllocationPolicy?.useIpAliases === true,
        databaseEncryptionState: data.databaseEncryption?.state,
        databaseEncryptionKey: data.databaseEncryption?.keyName,
        releaseChannel: data.releaseChannel?.channel,
        endpoint: data.endpoint,
        initialClusterVersion: data.initialClusterVersion,
        currentMasterVersion: data.currentMasterVersion,
        status: data.status,
        nodeIpv4CidrSize: data.nodeIpv4CidrSize,
        servicesIpv4Cidr: data.servicesIpv4Cidr,
        instanceGroupUrls: data.instanceGroupUrls,
        currentNodeCount: data.currentNodeCount,
        location: data.location,
      },
    },
  });
}
