import { getMockDNSManagedZone, getMockDNSPolicy } from '../../../test/mocks';
import {
  createDNSManagedZoneEntity,
  createDNSPolicyEntity,
} from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createDNSManagedZoneEntity', () => {
  test('should convert to entity', () => {
    expect(
      createDNSManagedZoneEntity(getMockDNSManagedZone()),
    ).toMatchSnapshot();
  });

  test('should set dnssec to "on" when dnssec is enabled', () => {
    expect(
      createDNSManagedZoneEntity(
        getMockDNSManagedZone({
          cloudLoggingConfig: {
            enableLogging: true,
          },
          dnssecConfig: {
            state: 'on',
            nonExistence: 'nsec3',
            kind: 'dns#managedZoneDnsSecConfig',
          },
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should set value to keySigningAlgorithm when it is present', () => {
    expect(
      createDNSManagedZoneEntity(
        getMockDNSManagedZone({
          cloudLoggingConfig: {
            enableLogging: null,
          },
          dnssecConfig: {
            state: 'on',
            defaultKeySpecs: [
              {
                keyType: 'keySigning',
                algorithm: 'rsasha256',
                keyLength: 2048,
                kind: 'dns#dnsKeySpec',
              },
            ],
            nonExistence: 'nsec3',
            kind: 'dns#managedZoneDnsSecConfig',
          },
        }),
      ),
    ).toMatchSnapshot();
  });

  test('should set value to zoneSigningAlgorithm when it is present', () => {
    expect(
      createDNSManagedZoneEntity(
        getMockDNSManagedZone({
          cloudLoggingConfig: {
            enableLogging: false,
          },
          dnssecConfig: {
            state: 'on',
            defaultKeySpecs: [
              {
                keyType: 'zoneSigning',
                algorithm: 'rsasha256',
                keyLength: 1024,
                kind: 'dns#dnsKeySpec',
              },
            ],
            nonExistence: 'nsec3',
            kind: 'dns#managedZoneDnsSecConfig',
          },
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createDNSPolicyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createDNSPolicyEntity(
        getMockDNSPolicy(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
