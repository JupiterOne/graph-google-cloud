import {
  createComputeDiskEntity,
  createComputeFirewallEntity,
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
  createComputeNetworkEntity,
  createComputeSubnetEntity,
  createFirewallRuleMappedRelationship,
  getIpAddressesForComputeInstance,
} from './converters';
import {
  getMockComputeDisk,
  getMockComputeFirewall,
  getMockComputeInstance,
  getMockNetwork,
  getMockSubnet,
} from '../../../test/mocks';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import {
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { INTERNET } from '@jupiterone/data-model';

describe('#createComputeDiskEntity', () => {
  test('should convert to entity', () => {
    expect(createComputeDiskEntity(getMockComputeDisk())).toMatchSnapshot();
  });

  test('should set active to false when status is not READY', () => {
    expect(
      createComputeDiskEntity(getMockComputeDisk({ status: 'FAILED' })),
    ).toMatchSnapshot();
  });
});

describe('#createComputeInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeInstanceEntity(getMockComputeInstance()),
    ).toMatchSnapshot();
  });

  test('should set active to false when status is not RUNNING', () => {
    expect(
      createComputeInstanceEntity(
        getMockComputeInstance({ status: 'SUSPENDED' }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeInstanceUsesComputeDiskRelationship', () => {
  test('should convert to relationship', () => {
    const computeDiskEntity = createComputeDiskEntity(getMockComputeDisk());
    const computeInstance = getMockComputeInstance();
    const computeInstanceEntity = createComputeInstanceEntity(computeInstance);

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
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/global/networks/public-compute-app-vpc',
              subnetwork:
                'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/regions/us-central1/subnetworks/public-compute-app-public-subnet-1',
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
