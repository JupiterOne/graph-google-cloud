import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchDNSManagedZones } from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { DNS_MANAGED_ZONE_ENTITY_TYPE } from './constants';

describe('#fetchDNSManagedZones', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchDNSManagedZones',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchDNSManagedZones(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === DNS_MANAGED_ZONE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DomainZone'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_dns_managed_zone' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          domainName: { type: 'string' },
          visibility: { type: 'string' },
          kind: { type: 'string' },
          dnssec: { type: 'string' },
          keySigningAlgorithm: { type: 'string' },
          zoneSigningAlgorithm: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });
  });
});
