import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchDNSManagedZones, fetchDNSPolicies } from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchComputeNetworks } from '../compute';
import {
  DNS_MANAGED_ZONE_ENTITY_TYPE,
  DNS_POLICY_ENTITY_TYPE,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_DNS_POLICY,
} from './constants';

const tempNewAccountConfig = {
  ...integrationConfig,
  serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
    'j1-gc-integration-dev-v2',
    'j1-gc-integration-dev-v3',
  ),
  serviceAccountKeyConfig: {
    ...integrationConfig.serviceAccountKeyConfig,
    project_id: 'j1-gc-integration-dev-v3',
  },
};

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
          cloudLoggingStatus: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchDNSPolicies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchDNSPolicies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeNetworks(context);
    await fetchDNSPolicies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === DNS_POLICY_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Ruleset'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_dns_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          kind: { type: 'string' },
          description: { type: 'string' },
          enableInboundForwarding: { type: 'boolean' },
          enableLogging: { type: 'boolean' },
          networks: { type: 'array' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_DNS_POLICY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_compute_network_has_dns_policy',
          },
        },
      },
    });
  });
});
