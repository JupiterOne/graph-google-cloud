import { container_v1 } from 'googleapis';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import {
  CONTAINER_CLUSTER_ENTITY_CLASS,
  CONTAINER_CLUSTER_ENTITY_TYPE,
  CONTAINER_NODE_POOL_ENTITY_CLASS,
  CONTAINER_NODE_POOL_ENTITY_TYPE,
} from './constants';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';

export function getContainerClusterKey(clusterId: string) {
  return `${CONTAINER_CLUSTER_ENTITY_TYPE}:${clusterId}`;
}

function prefixObjectKeys(
  prefix: string,
  labels: { [key: string]: string } | undefined | null,
) {
  if (!labels) {
    return;
  }

  return Object.entries(labels).reduce(
    (acc, [key, value]) => ({ ...acc, [`${prefix}.${key}`]: value }),
    {},
  );
}

export function createContainerClusterEntity(
  data: container_v1.Schema$Cluster,
  projectId: string,
) {
  const { nodePools, ...withoutPools } = data;

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: withoutPools,
      assign: {
        _key: getContainerClusterKey(
          // According to past recordings, there may have been a time where
          // Google Container clusters did _not_ have an `id` property...
          //
          // We'll know soon whether this is the case via logs...
          withoutPools.id! || withoutPools.selfLink!,
        ),
        _type: CONTAINER_CLUSTER_ENTITY_TYPE,
        _class: CONTAINER_CLUSTER_ENTITY_CLASS,
        id: withoutPools.id!,
        createdOn: parseTimePropertyValue(withoutPools.createTime),
        name: withoutPools.name,
        description: withoutPools.description,
        initialNodeCode: withoutPools.initialNodeCount,
        nodeMachineType: withoutPools.nodeConfig?.machineType,
        nodeDiskSizeGb: withoutPools.nodeConfig?.diskSizeGb,
        nodeOAuthScopes: withoutPools.nodeConfig?.oauthScopes,
        nodeImageType: withoutPools.nodeConfig?.imageType,
        nodePreemptible: withoutPools.nodeConfig?.preemptible,
        nodeDiskType: withoutPools.nodeConfig?.diskType,
        nodeEnableIntegrityMonitoring:
          withoutPools.nodeConfig?.shieldedInstanceConfig
            ?.enableIntegrityMonitoring,
        nodeEnableSecureBoot:
          withoutPools.nodeConfig?.shieldedInstanceConfig?.enableSecureBoot,
        network: withoutPools.networkConfig?.network,
        // 6.6.1 Enable VPC Flow Logs and Intranode Visibility (Not Scored)
        intraNodeVisibilityEnabled:
          withoutPools.networkConfig?.enableIntraNodeVisibility === true,
        // 6.6.3 Ensure Master Authorized Networks is Enabled (Scored)
        masterAuthorizedNetworksEnabled:
          withoutPools.masterAuthorizedNetworksConfig?.enabled === true,
        clusterIpv4Cidr: withoutPools.clusterIpv4Cidr,
        kubernetesDashboardEnabled:
          withoutPools.addonsConfig?.kubernetesDashboard?.disabled !== true,
        networkPolicyConfigEnabled:
          withoutPools.addonsConfig?.networkPolicyConfig?.disabled !== true,
        subnetwork: withoutPools.networkConfig?.subnetwork,
        locations: withoutPools.locations,
        useRoutes: withoutPools.ipAllocationPolicy?.useRoutes === true,
        // 6.6.2 Ensure use of VPC-native clusters (Scored)
        useIpAliases: withoutPools.ipAllocationPolicy?.useIpAliases === true,
        // 6.3.1 Ensure Kubernetes Secrets are encrypted using keys managed in Cloud KMS (Scored)
        databaseEncryptionState: withoutPools.databaseEncryption?.state,
        databaseEncryptionKey: withoutPools.databaseEncryption?.keyName,
        // 6.5.4 Automate GKE version management using Release Channels (Not Scored)
        releaseChannel: withoutPools.releaseChannel?.channel,
        // 6.5.5 Ensure Shielded GKE Nodes are Enabled (Not Scored)
        shieldedNodesEnabled: withoutPools.shieldedNodes?.enabled === true,
        endpoint: withoutPools.endpoint,
        initialClusterVersion: withoutPools.initialClusterVersion,
        currentMasterVersion: withoutPools.currentMasterVersion,
        status: withoutPools.status,
        nodeIpv4CidrSize: withoutPools.nodeIpv4CidrSize,
        servicesIpv4Cidr: withoutPools.servicesIpv4Cidr,
        instanceGroupUrls: withoutPools.instanceGroupUrls,
        currentNodeCount: withoutPools.currentNodeCount,
        location: withoutPools.location,
        // 6.1.4 Minimize Container Registries to only those approved (Not Scored)
        binaryAuthorizationEnabled:
          withoutPools.binaryAuthorization?.enabled === true,
        // 6.6.4 Ensure clusters are created with Private Endpoint Enabled and Public Access Disabled (Scored)
        privateEndpointEnabled:
          withoutPools.privateClusterConfig?.enablePrivateEndpoint === true,
        // 6.6.5 Ensure clusters are created with Private Nodes (Scored)
        privateNodesEnabled:
          withoutPools.privateClusterConfig?.enablePrivateNodes === true,
        // 6.6.7 Ensure Network Policy is Enabled and set as appropriate (Not Scored)
        networkPolicyEnabled: withoutPools.networkPolicy?.enabled === true,
        // 6.7.1 Ensure Stackdriver Kubernetes Logging and Monitoring is Enabled (Scored)
        loggingService: withoutPools.loggingService,
        monitoringService: withoutPools.monitoringService,
        // 6.8.1 Ensure Basic Authentication using static passwords is Disabled (Scored)
        basicAuthenticationEnabled:
          withoutPools.masterAuth?.password && withoutPools.masterAuth?.username
            ? true
            : false,
        // 6.8.2 Ensure authentication using Client Certificates is Disabled (Scored)
        clientCertificatesEnabled: withoutPools.masterAuth?.clientKey
          ? true
          : false,
        // 6.8.3 Manage Kubernetes RBAC users with Google Groups for GKE (Not Scored)
        rbacEnabled: withoutPools.authenticatorGroupsConfig?.enabled === true,
        // 6.8.4 Ensure Legacy Authorization (ABAC) is Disabled (Scored)
        abacEnabled: withoutPools.legacyAbac?.enabled === true,
        // 6.10.2 Ensure that Alpha clusters are not used for production workloads (Scored)
        isAlphaCluster: withoutPools.enableKubernetesAlpha === true,
        // 6.2.2 Prefer using dedicated GCP Service Accounts and Workload Identity (Not Scored)
        workloadIdentity: withoutPools.workloadIdentityConfig?.workloadPool,
        // The console has this under section Metadata > Description
        'metadata.description': data.description,
        // The console has these labels under section Metadata > Labels
        ...prefixObjectKeys('metadata.labels', data.resourceLabels),
        webLink: getGoogleCloudConsoleWebLink(
          `/kubernetes/clusters/details/${withoutPools.location}/${withoutPools.name}/details?folder=&organizationId=&project=${projectId}`,
        ),
      },
    },
  });
}

export function createContainerNodePoolEntity(
  data: container_v1.Schema$NodePool,
  projectId: string,
  location: string,
  clusterName: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.selfLink as string,
        _type: CONTAINER_NODE_POOL_ENTITY_TYPE,
        _class: CONTAINER_NODE_POOL_ENTITY_CLASS,
        name: data.name,
        initialNodeCount: data.initialNodeCount,
        podIpv4CidrSize: data.podIpv4CidrSize,
        // 6.4.1 Ensure legacy Compute Engine instance metadata APIs are Disabled (Scored)
        legacyEndpointsDisabled: data.config?.metadata
          ? data.config?.metadata['disable-legacy-endpoints'] === 'true'
          : false,
        // 6.4.2 Ensure the GKE Metadata Server is Enabled (Not Scored)
        gkeMetadataServerEnabled:
          data.config?.workloadMetadataConfig?.mode === 'GKE_METADATA',
        // 6.5.1 Ensure Container-Optimized OS (COS) is used for GKE node images (Scored)
        imageType: data.config?.imageType,
        // 6.5.2 Ensure Node Auto-Repair is enabled for GKE nodes (Scored)
        autoRepairEnabled: data.management?.autoRepair === true,
        // 6.5.3 Ensure Node Auto-Upgrade is enabled for GKE nodes (Scored)
        autoUpgradeEnabled: data.management?.autoUpgrade === true,
        // 6.5.6 Ensure Integrity Monitoring for Shielded GKE Nodes is Enabled (Not Scored)
        integrityMonitoringEnabled:
          data.config?.shieldedInstanceConfig?.enableIntegrityMonitoring ===
          true,
        // 6.5.7 Ensure Secure Boot for Shielded GKE Nodes is Enabled (Not Scored)
        secureBootEnabled:
          data.config?.shieldedInstanceConfig?.enableSecureBoot === true,
        status: data.status,
        statusMessage: data.statusMessage,
        version: data.version,
        // 6.10.4 Consider GKE Sandbox for running untrusted workloads (Not Scored)
        gkeSandboxEnabled:
          data.config?.sandboxConfig?.type?.toLowerCase() === 'gvisor',
        // 6.2.1 Ensure GKE clusters are not running using the Compute Engine default service account (Scored)
        serviceAccount: data.config?.serviceAccount,
        // 6.9.1 Enable Customer-Managed Encryption Keys (CMEK) for GKE Persistent Disks (PD) (Not Scored)
        bootDiskKmsKey: data.config?.bootDiskKmsKey,
        // The console has these labels under section Metadata > GCE instance metadata
        ...prefixObjectKeys('metadata.gce', data.config?.metadata),
        // The console has these labels under section Metadata > Kubernetes labels
        ...prefixObjectKeys('metadata.labels', data.config?.labels),
        // The console has these labels under section Metadata > Network tags
        'metadata.networkTags': data.config?.tags,
        webLink: getGoogleCloudConsoleWebLink(
          `/kubernetes/nodepool/${location}/${clusterName}/${data.name}?folder=&organizationId=&project=${projectId}`,
        ),
      },
    },
  });
}
