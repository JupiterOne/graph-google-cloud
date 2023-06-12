import {
  createBackendBucketEntity,
  createBackendServiceEntity,
  createComputeAddressEntity,
  createComputeDiskEntity,
  createComputeFirewallEntity,
  createComputeForwardingRuleEntity,
  createComputeGlobalAddressEntity,
  createComputeGlobalForwardingRuleEntity,
  createComputeImageEntity,
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
  createComputeNetworkEntity,
  createComputeProjectEntity,
  createComputeRegionDiskEntity,
  createComputeSubnetEntity,
  createFirewallRuleMappedRelationship,
  createHealthCheckEntity,
  createInstanceGroupEntity,
  createLoadBalancerEntity,
  createRegionBackendServiceEntity,
  createRegionHealthCheckEntity,
  createRegionInstanceGroupEntity,
  createRegionLoadBalancerEntity,
  createRegionTargetHttpProxyEntity,
  createSslPolicyEntity,
  createTargetHttpProxyEntity,
  createTargetHttpsProxyEntity,
  createTargetSslProxyEntity,
  getBlockProjectSSHKeysValue,
  getIpAddressesForComputeInstance,
} from './converters';
import {
  getMockComputeDisk,
  getMockComputeFirewall,
  getMockComputeInstance,
  getMockNetwork,
  getMockSubnet,
  getMockComputeProject,
  getMockBackendBucket,
  getMockBackendService,
  getMockHealthCheck,
  getMockInstanceGroup,
  getMockLoadBalancer,
  getMockTargetHttpProxy,
  getMockTargetHttpsProxy,
  getMockTargetSslProxy,
  getMockSslPolicy,
  getMockComputeImage,
  getMockComputeAddress,
  getMockComputeRegionDisk,
  getMockRegionHealthCheck,
  getMockRegionLoadBalancer,
  getMockRegionInstanceGroup,
  getMockRegionBackendService,
  getMockRegionTargetHttpProxy,
  getMockComputeGlobalForwardingRule,
  getMockComputeForwardingRule,
  getMockComputeGlobalAddress,
  getMockComputeInstanceInventory,
} from '../../../test/mocks';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import {
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { INTERNET } from '@jupiterone/data-model';

describe('#createComputeDiskEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeDiskEntity(
        getMockComputeDisk(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should set active to false when status is not READY', () => {
    expect(
      createComputeDiskEntity(
        getMockComputeDisk({ status: 'FAILED' }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeRegionDiskEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeRegionDiskEntity(
        getMockComputeRegionDisk(),
        'j1-gc-integration-dev-v3',
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeImageEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeImageEntity({
        data: getMockComputeImage(),
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });

  test('should set deprecated to true if the image is deprecated', () => {
    expect(
      createComputeImageEntity({
        data: getMockComputeImage({
          deprecated: {
            state: 'DEPRECATED',
            replacement:
              'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/global/images/example-disk-image',
          },
        }),
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });

  test('should set deprecated to false if the image is not deprecated', () => {
    expect(
      createComputeImageEntity({
        data: getMockComputeImage(),
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createComputeInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeInstanceEntity(
        getMockComputeInstance(),
        getMockComputeInstanceInventory(),
        'j1-integration-dev-v2',
      ),
    ).toMatchSnapshot();
  });

  test('should set connectedNetworksCount to 2 when there are 2 network interfaces', () => {
    expect(
      createComputeInstanceEntity(
        getMockComputeInstance({
          networkInterfaces: [
            {
              network:
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/global/networks/default',
              subnetwork:
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/regions/us-central1/subnetworks/default',
              networkIP: '10.128.0.2',
              name: 'nic0',
              fingerprint: 'RpvQNHzHRp8=',
              kind: 'compute#networkInterface',
            },
            {
              network:
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/global/networks/default2',
              subnetwork:
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/regions/us-central1/subnetworks/default2',
              networkIP: '10.128.0.22',
              name: 'nic1',
              fingerprint: 'RpvQNHzHRp8=',
              kind: 'compute#networkInterface',
            },
          ],
        }),
        getMockComputeInstanceInventory(),
        'j1-integration-dev-v2',
      ),
    ).toMatchSnapshot();
  });

  test('should set active to false when status is not RUNNING', () => {
    expect(
      createComputeInstanceEntity(
        getMockComputeInstance({ status: 'SUSPENDED' }),
        getMockComputeInstanceInventory(),
        'j1-integration-dev-v2',
      ),
    ).toMatchSnapshot();
  });

  test('should set isOSLoginEnabled to true when enabled-oslogin metadata value is "TRUE"', () => {
    expect(
      createComputeInstanceEntity(
        getMockComputeInstance({
          metadata: {
            items: [
              {
                key: 'enable-oslogin',
                value: 'TRUE',
              },
            ],
            kind: 'compute#metadata',
          },
        }),
        getMockComputeInstanceInventory(),
        'j1-integration-dev-v2',
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeProjectEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeProjectEntity(getMockComputeProject()),
    ).toMatchSnapshot();
  });

  test('should set isOSLoginEnabled to true when enabled-oslogin metadata value is "TRUE"', () => {
    expect(
      createComputeProjectEntity(
        getMockComputeProject({
          commonInstanceMetadata: {
            items: [
              {
                key: 'enable-oslogin',
                value: 'TRUE',
              },
            ],
            kind: 'compute#metadata',
          },
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeAddressEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeAddressEntity(
        getMockComputeAddress(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have list of resources using the address if resources are using it', () => {
    expect(
      createComputeAddressEntity(
        getMockComputeAddress({
          users: [
            'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/zones/us-central1-a/instances/instance-custom-image',
          ],
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeAddressEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeGlobalAddressEntity(
        getMockComputeGlobalAddress(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have list of resources using the address if resources are using it', () => {
    expect(
      createComputeAddressEntity(
        getMockComputeAddress({
          users: [
            'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/zones/us-central1-a/instances/instance-custom-image',
          ],
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeInstanceUsesComputeDiskRelationship', () => {
  test('should convert to relationship', () => {
    const computeDiskEntity = createComputeDiskEntity(
      getMockComputeDisk(),
      'j1-gc-integration-dev-v2',
    );
    const computeInstance = getMockComputeInstance();
    const computeInstnaceInventory = getMockComputeInstanceInventory();
    const computeInstanceEntity = createComputeInstanceEntity(
      computeInstance,
      computeInstnaceInventory,
      'j1-integration-dev-v2',
    );

    expect(
      createComputeInstanceUsesComputeDiskRelationship({
        computeInstanceEntity,
        computeDiskEntity,
        mode: 'READ_WRITE',
        autoDelete: true,
        deviceName: 'persisten-disk-0',
        interface: 'SCSI',
      }),
    ).toMatchSnapshot();
  });
});

describe('#createFirewallRuleMappedRelationship', () => {
  test('should convert to mapped relationship', () => {
    const firewallEntity = createComputeFirewallEntity(
      getMockComputeFirewall(),
    );

    expect(
      createFirewallRuleMappedRelationship({
        _class: RelationshipClass.ALLOWS,
        relationshipDirection: RelationshipDirection.REVERSE,
        targetFilterKeys: [['_key']],
        targetEntity: INTERNET,
        firewallEntity,
        properties: {
          ipRange: '0.0.0.0/0',
          protocol: 'tcp',
          ipProtocol: 'tcp',
          portRange: '443',
          fromPort: 443,
          toPort: 443,
          ruleIndex: 0,
          protocolIndex: 0,
        },
      }),
    ).toMatchSnapshot();
  });
});

describe('#createComputeFirewallEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeFirewallEntity(getMockComputeFirewall()),
    ).toMatchSnapshot();
  });
});

describe('#createComputeSubnetEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeSubnetEntity(
        getMockSubnet(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have flowLogsEnabled set to true if it is enabled for subnet', () => {
    expect(
      createComputeSubnetEntity(
        getMockSubnet({
          logConfig: {
            enable: true,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeNetworkEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeNetworkEntity(
        getMockNetwork(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#getIpAddressesForComputeInstance', () => {
  test('should get IP addresses given a compute instance with network interfaces and accessConfigs', () => {
    expect(
      getIpAddressesForComputeInstance(
        getMockComputeInstance({
          networkInterfaces: [
            {
              network:
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/global/networks/public-compute-app-vpc',
              subnetwork:
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/regions/us-central1/subnetworks/public-compute-app-public-subnet-1',
              networkIP: '10.10.1.2',
              name: 'nic0',
              accessConfigs: [
                {
                  type: 'ONE_TO_ONE_NAT',
                  name: 'external-nat',
                  natIP: '34.71.33.132',
                  networkTier: 'PREMIUM',
                  kind: 'compute#accessConfig',
                },
              ],
              fingerprint: 'ElJkype-dKI=',
              kind: 'compute#networkInterface',
            },
          ],
        }),
      ),
    ).toEqual({
      publicIpAddresses: ['34.71.33.132'],
      privateIpAddresses: ['10.10.1.2'],
    });
  });
});

describe('#createBackendBucketEntity', () => {
  test('should convert to entity', () => {
    expect(createBackendBucketEntity(getMockBackendBucket())).toMatchSnapshot();
  });
});

describe('#createBackendServiceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createBackendServiceEntity(getMockBackendService()),
    ).toMatchSnapshot();
  });
});

describe('#createRegionBackendServiceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createRegionBackendServiceEntity(getMockRegionBackendService()),
    ).toMatchSnapshot();
  });
});

describe('#createHealthCheckEntity', () => {
  test('should convert to entity', () => {
    expect(
      createHealthCheckEntity(
        getMockHealthCheck(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createRegionHealthCheckEntity', () => {
  test('should convert to entity', () => {
    expect(
      createRegionHealthCheckEntity(
        getMockRegionHealthCheck(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createRegionInstanceGroupEntity', () => {
  test('should convert to entity', () => {
    expect(
      createRegionInstanceGroupEntity(
        getMockRegionInstanceGroup(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        'us-central1',
      ),
    ).toMatchSnapshot();
  });
});

describe('#createInstanceGroupEntity', () => {
  test('should convert to entity', () => {
    expect(
      createInstanceGroupEntity(
        getMockInstanceGroup(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        'us-central1-a',
      ),
    ).toMatchSnapshot();
  });
});

describe('#createGlobalForwardingRuleEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeGlobalForwardingRuleEntity(
        getMockComputeGlobalForwardingRule(),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createForwardingRuleEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeForwardingRuleEntity(getMockComputeForwardingRule()),
    ).toMatchSnapshot();
  });
});

describe('#createLoadBalancerEntity', () => {
  test('should convert to entity', () => {
    expect(
      createLoadBalancerEntity(getMockRegionLoadBalancer()),
    ).toMatchSnapshot();
  });
});

describe('#createRegionLoadBalancerEntity', () => {
  test('should convert to entity', () => {
    expect(
      createRegionLoadBalancerEntity(getMockLoadBalancer()),
    ).toMatchSnapshot();
  });
});

describe('#createTargetHttpProxyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createTargetHttpProxyEntity(getMockTargetHttpProxy()),
    ).toMatchSnapshot();
  });
});

describe('#createRegionTargetHttpProxyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createRegionTargetHttpProxyEntity(getMockRegionTargetHttpProxy()),
    ).toMatchSnapshot();
  });
});

describe('#createTargetHttpsProxyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createTargetHttpsProxyEntity(getMockTargetHttpsProxy()),
    ).toMatchSnapshot();
  });
});

describe('#createRegionTargetHttpsProxyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createTargetHttpsProxyEntity(getMockTargetHttpsProxy()),
    ).toMatchSnapshot();
  });
});

describe('#createTargetSslProxyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createTargetSslProxyEntity(getMockTargetSslProxy()),
    ).toMatchSnapshot();
  });
});

describe('#createSslPolicyEntity', () => {
  test('should convert to entity', () => {
    expect(createSslPolicyEntity(getMockSslPolicy())).toMatchSnapshot();
  });
});

describe('#getBlockProjectSSHKeysValue', () => {
  test('should return `true` if value of `block-project-ssh-keys` value is `TRUE`', () => {
    expect(
      getBlockProjectSSHKeysValue({
        kind: 'compute#metadata',
        fingerprint: 'abc123',
        items: [
          {
            key: 'block-project-ssh-keys',
            value: 'TRUE',
          },
        ],
      }),
    ).toEqual(true);
  });

  test('should return `true` if value of `block-project-ssh-keys` value is `true`', () => {
    expect(
      getBlockProjectSSHKeysValue({
        kind: 'compute#metadata',
        fingerprint: 'abc123',
        items: [
          {
            key: 'block-project-ssh-keys',
            value: 'true',
          },
        ],
      }),
    ).toEqual(true);
  });

  test('should return `false` if `metadata` is `undefined`', () => {
    expect(getBlockProjectSSHKeysValue(undefined)).toEqual(false);
  });

  test('should return `false` if value of `block-project-ssh-keys` value `undefined`', () => {
    expect(
      getBlockProjectSSHKeysValue({
        kind: 'compute#metadata',
        fingerprint: 'abc123',
        items: [
          {
            key: 'block-project-ssh-keys',
          },
        ],
      }),
    ).toEqual(false);
  });

  test('should return `false` if value of `block-project-ssh-keys` value is invalid', () => {
    expect(
      getBlockProjectSSHKeysValue({
        kind: 'compute#metadata',
        fingerprint: 'abc123',
        items: [
          {
            key: 'block-project-ssh-keys',
            value: 'abc123',
          },
        ],
      }),
    ).toEqual(false);
  });
});
