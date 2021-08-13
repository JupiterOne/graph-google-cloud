import { dataproc_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_DATAPROC_CLUSTER,
  ENTITY_TYPE_DATAPROC_CLUSTER,
} from './constants';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';

export function createDataprocClusterEntity(data: dataproc_v1.Schema$Cluster) {
  const region = data.labels ? data.labels['goog-dataproc-location'] : null;

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_DATAPROC_CLUSTER,
        _type: ENTITY_TYPE_DATAPROC_CLUSTER,
        _key: `projects/${data.projectId}/regions/${region}/clusters/${data.clusterName}`,
        id: data.clusterUuid as string,
        name: data.clusterName,
        encrypted: true,
        kmsKeyName: data.config?.encryptionConfig?.gcePdKmsKeyName,
        status: data.status?.state,
        active: data.status?.state === 'RUNNING',
        configBucket: data.config?.configBucket,
        tempBucket: data.config?.tempBucket,
        zoneUri: data.config?.gceClusterConfig?.zoneUri,
        networkUri: data.config?.gceClusterConfig?.networkUri,
        masterConfigNumInstances: data.config?.masterConfig?.numInstances,
        masterConfigImageUri: data.config?.masterConfig?.imageUri,
        masterConfigMachineTypeUri: data.config?.masterConfig?.machineTypeUri,
        masterConfigMinCpuPlatform: data.config?.masterConfig?.minCpuPlatform,
        masterConfigPreemptibility: data.config?.masterConfig?.preemptibility,
        workerConfigNumInstances: data.config?.workerConfig?.numInstances,
        workerConfigImageUri: data.config?.workerConfig?.imageUri,
        workerConfigMachineTypeUri: data.config?.workerConfig?.machineTypeUri,
        workerConfigMinCpuPlatform: data.config?.workerConfig?.minCpuPlatform,
        workerConfigPreemptibility: data.config?.workerConfig?.preemptibility,
        softwareConfigImageVersion: data.config?.softwareConfig?.imageVersion,
        enableKerberos:
          data.config?.securityConfig?.kerberosConfig?.enableKerberos,
        rootPrincipalPasswordUri:
          data.config?.securityConfig?.kerberosConfig?.rootPrincipalPasswordUri,
        kmsKeyUri: data.config?.securityConfig?.kerberosConfig?.kmsKeyUri,
        keystoreUri: data.config?.securityConfig?.kerberosConfig?.keystoreUri,
        truststoreUri:
          data.config?.securityConfig?.kerberosConfig?.truststoreUri,
        keystorePasswordUri:
          data.config?.securityConfig?.kerberosConfig?.keystorePasswordUri,
        keyPasswordUri:
          data.config?.securityConfig?.kerberosConfig?.keyPasswordUri,
        truststorePasswordUri:
          data.config?.securityConfig?.kerberosConfig?.truststorePasswordUri,
        crossRealmTrustRealm:
          data.config?.securityConfig?.kerberosConfig?.crossRealmTrustRealm,
        crossRealmTrustKdc:
          data.config?.securityConfig?.kerberosConfig?.crossRealmTrustKdc,
        crossRealmTrustAdminServer:
          data.config?.securityConfig?.kerberosConfig
            ?.crossRealmTrustAdminServer,
        crossRealmTrustSharedPasswordUri:
          data.config?.securityConfig?.kerberosConfig
            ?.crossRealmTrustSharedPasswordUri,
        kdcDbKeyUri: data.config?.securityConfig?.kerberosConfig?.kdcDbKeyUri,
        tgtLifetimeHours:
          data.config?.securityConfig?.kerberosConfig?.tgtLifetimeHours,
        realm: data.config?.securityConfig?.kerberosConfig?.realm,
        webLink: getGoogleCloudConsoleWebLink(
          region
            ? `/dataproc/clusters/${data.clusterName}/monitoring?region=${region}&project=${data.projectId}`
            : `/dataproc/clusters?project=${data.projectId}`,
        ),
      },
    },
  });
}
