import {
  createContainerClusterEntity,
  createContainerNodePoolEntity,
} from './converters';
import {
  getMockContainerCluster,
  getMockContainerNodePool,
} from '../../../test/mocks';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

const DEFAULT_CLUSTER_LOCATION = 'northamerica-northeast1-a';
const DEFAULT_CLUSTER_NAME = 'my-first-cluster-1';

describe('#createContainerClusterEntity', () => {
  test('should convert to entity', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have binaryAuthorizationEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have binaryAuthorizationEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          binaryAuthorization: {
            enabled: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have shieldedNodesEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have shieldedNodesEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          shieldedNodes: {
            enabled: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have databaseEncryptionState set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          databaseEncryption: {
            keyName:
              'projects/j1-gc-integration-dev-v2/locations/northamerica-northeast1/keyRings/gke-keyring/cryptoKeys/gke-key',
            state: 'ENCRYPTED',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have intraNodeVisibilityEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          networkConfig: {
            enableIntraNodeVisibility: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have intraNodeVisibilityEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          networkConfig: {
            enableIntraNodeVisibility: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have useIpAliases set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          ipAllocationPolicy: {
            useIpAliases: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have useIpAliases set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          ipAllocationPolicy: {
            useIpAliases: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have masterAuthorizedNetworksEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          masterAuthorizedNetworksConfig: {
            enabled: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have masterAuthorizedNetworksEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          masterAuthorizedNetworksConfig: {
            enabled: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have privateEndpointEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          privateClusterConfig: {
            enablePrivateEndpoint: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have privateEndpointEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          privateClusterConfig: {
            enablePrivateEndpoint: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have privateNodesEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          privateClusterConfig: {
            enablePrivateNodes: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have privateNodesEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          privateClusterConfig: {
            enablePrivateNodes: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have networkPolicyEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          networkPolicy: {
            enabled: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have networkPolicyEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          networkPolicy: {
            enabled: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have basicAuthenticationEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have basicAuthenticationEnabled set to false if either username or password is missing', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          masterAuth: {
            password: 'test',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have basicAuthenticationEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          masterAuth: {
            password: 'test',
            username: 'test',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have clientCertificatesEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have clientCertificatesEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          masterAuth: {
            clientKey: 'test',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have rbacEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have rbacEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          authenticatorGroupsConfig: {
            enabled: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have abacEnabled set to false if it is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have abacEnabled set to true if it is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          legacyAbac: {
            enabled: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have workloadIdentity set to namespace if the Workload Identity is enabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster({
          workloadIdentityConfig: {
            workloadPool: 'j1-gc-integration-dev-v2.svc.id.goog',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have workloadIdentity set to undefined if the Workload Identity is disabled', () => {
    expect(
      createContainerClusterEntity(
        getMockContainerCluster(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createContainerNodePoolEntity', () => {
  test('should convert to entity', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have autoRepairEnabled set to true if it is enabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          management: {
            autoRepair: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have autoRepairEnabled set to false if it is disabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          management: {
            autoRepair: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have autoUpgradeEnabled set to true if it is enabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          management: {
            autoUpgrade: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have autoUpgradeEnabled set to false if it is disabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          management: {
            autoUpgrade: false,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have integrityMonitoringEnabled set to false if it is disabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            shieldedInstanceConfig: {
              enableIntegrityMonitoring: false,
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have integrityMonitoringEnabled set to true if it is enabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            shieldedInstanceConfig: {
              enableIntegrityMonitoring: true,
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have legacyEndpointsDisabled set to true if they are disabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            metadata: {
              'disable-legacy-endpoints': 'true',
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have legacyEndpointsDisabled set to false if they are enabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            metadata: {
              'disable-legacy-endpoints': 'false',
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have gkeMetadataServerEnabled set to true if it is enabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            workloadMetadataConfig: {
              mode: 'GKE_METADATA',
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have gkeMetadataServerEnabled set to false if it is disabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have secureBootEnabled set to false if it is disabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            shieldedInstanceConfig: {
              enableSecureBoot: false,
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have secureBootEnabled set to true if it is enabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            shieldedInstanceConfig: {
              enableSecureBoot: true,
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have gkeSandboxEnabled set to false if it is disabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have gkeSandboxEnabled set to true if it is enabled', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            sandboxConfig: {
              type: 'gvisor',
            },
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have serviceAccount set to some value if it is not using the default one', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            serviceAccount:
              'example-service-account@project-id.gserviceaccount.com',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have serviceAccount set to undefined if it is using the default service account', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have bootDiskKmsKey set to a value if boot disk encryption type is set to customer managed', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool({
          config: {
            bootDiskKmsKey: 'example-key',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });

  test('should have bootDiskKmsKey set to undefined if boot disk encryption type is not set to customer managed', () => {
    expect(
      createContainerNodePoolEntity(
        getMockContainerNodePool(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        DEFAULT_CLUSTER_LOCATION,
        DEFAULT_CLUSTER_NAME,
      ),
    ).toMatchSnapshot();
  });
});
