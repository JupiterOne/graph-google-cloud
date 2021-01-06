jest.setTimeout(60000);

import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import {
  setupGoogleCloudRecording,
  withRecording,
} from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  fetchComputeDisks,
  fetchComputeFirewalls,
  fetchComputeInstances,
  fetchComputeNetworks,
  fetchComputeSubnetworks,
} from '.';
import { integrationConfig } from '../../../test/config';
import {
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
  RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
} from './constants';
import {
  IntegrationProviderAuthorizationError,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { fetchIamServiceAccounts } from '../iam';

describe('#fetchComputeDisks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeDisks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeDisks(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ['DataStore', 'Disk'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_disk' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          description: { type: 'string' },
          zone: { type: 'string' },
          sizeGB: { type: 'string' },
          status: { type: 'string' },
          sourceImage: { type: 'string' },
          sourceImageId: { type: 'string' },
          type: { type: 'string' },
          licenses: {
            type: 'array',
            items: { type: 'string' },
          },
          guestOsFeatures: {
            type: 'array',
            items: { type: 'string' },
          },
          lastAttachTimestamp: { type: 'number' },
          labelFingerprint: { type: 'string' },
          licenseCodes: {
            type: 'array',
            items: { type: 'string' },
          },
          physicalBlockSizeBytes: { type: 'string' },
          kind: { type: 'string' },
          encrypted: true,
        },
      },
    });
  });
});

describe('#fetchComputeInstances', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeInstances',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchIamServiceAccounts(context);
    await fetchComputeDisks(context);
    await fetchComputeInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_DISK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore', 'Disk'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_disk' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          description: { type: 'string' },
          zone: { type: 'string' },
          sizeGB: { type: 'string' },
          status: { type: 'string' },
          sourceImage: { type: 'string' },
          sourceImageId: { type: 'string' },
          type: { type: 'string' },
          licenses: {
            type: 'array',
            items: { type: 'string' },
          },
          guestOsFeatures: {
            type: 'array',
            items: { type: 'string' },
          },
          lastAttachTimestamp: { type: 'number' },
          labelFingerprint: { type: 'string' },
          licenseCodes: {
            type: 'array',
            items: { type: 'string' },
          },
          physicalBlockSizeBytes: { type: 'string' },
          kind: { type: 'string' },
          encrypted: true,
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_INSTANCE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Host'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          machineType: { type: 'string' },
          status: { type: 'string' },
          zone: { type: 'string' },
          canIpForward: { type: 'boolean' },
          cpuPlatform: { type: 'string' },
          labelFingerprint: { type: 'string' },
          startRestricted: { type: 'boolean' },
          deletionProtection: { type: 'boolean' },
          fingerprint: { type: 'string' },
          kind: { type: 'string' },
        },
      },
    });

    const computeInstanceUsesDiskRelationship = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'google_compute_instance_uses_disk',
    );

    expect(computeInstanceUsesDiskRelationship).toEqual(
      computeInstanceUsesDiskRelationship.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );

    const computeInstanceTrustsServiceAccountRelationship = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'google_compute_instance_trusts_iam_service_account',
    );

    expect(computeInstanceTrustsServiceAccountRelationship).toEqual(
      computeInstanceTrustsServiceAccountRelationship.map((r) =>
        expect.objectContaining({
          _class: RelationshipClass.TRUSTS,
        }),
      ),
    );
  });
});

describe('#fetchComputeNetworks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeNetworks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeNetworks(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_INSTANCE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Network'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          machineType: { type: 'string' },
          status: { type: 'string' },
          zone: { type: 'string' },
          canIpForward: { type: 'boolean' },
          cpuPlatform: { type: 'string' },
          labelFingerprint: { type: 'string' },
          startRestricted: { type: 'boolean' },
          deletionProtection: { type: 'boolean' },
          fingerprint: { type: 'string' },
          kind: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchComputeSubnetworks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeSubnetworks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeNetworks(context);
    await fetchComputeSubnetworks(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_SUBNETWORK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Network'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_subnetwork' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          privateIpGoogleAccess: { type: 'boolean' },
          purpose: { type: 'string' },
          gatewayAddress: { type: 'string' },
          CIDR: { type: 'string' },
          public: { type: 'boolean' },
          internal: { type: 'boolean' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONTAINS' },
          _type: { const: 'google_compute_network_contains_subnetwork' },
        },
      },
    });
  });
});

describe('#fetchComputeFirewalls', () => {
  let recording: Recording;

  beforeAll(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeFirewalls',
    });
  });

  afterAll(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeNetworks(context);
    await fetchComputeSubnetworks(context);
    await fetchComputeFirewalls(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_FIREWALL,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Firewall'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_firewall' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          category: { const: ['network'] },
          network: { type: 'string' },
          priority: { type: 'number' },
          sourceRanges: {
            type: 'array',
            items: { type: 'string' },
          },
          targetTags: {
            type: 'array',
            items: { type: 'string' },
          },
          sourceTags: {
            type: 'array',
            items: { type: 'string' },
          },
          allowed: { type: 'string' },
          denied: { type: 'string' },
          ingress: { type: 'boolean' },
          egress: { type: 'boolean' },
          logConfigEnabled: { type: 'boolean' },
          logConfigMetadata: { type: 'string' },
          disabled: { type: 'boolean' },
          destinationRanges: {
            type: 'array',
            items: { type: 'string' },
          },
          sourceServiceAccounts: {
            type: 'array',
            items: { type: 'string' },
          },
          targetServiceAccounts: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          internal: { type: 'boolean' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'PROTECTS' },
          _type: { const: 'google_compute_firewall_protects_network' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_network_has_firewall' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships
        .filter((e) => e._type === MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE)
        .map((r) => {
          return {
            ...r,
            // TODO: Remove this when we support a `toMatchMappedRelationshipSchema`
            // validator.
            _mapping: null,
          };
        }),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: {
            type: 'string',
            enum: ['ALLOWS', 'DENIES'],
          },
          _type: { const: 'google_cloud_firewall_rule' },
          fromPort: { type: 'number' },
          toPort: { type: 'number' },
          ipProtocol: { type: 'string' },
          protocol: { type: 'string' },
          ipRange: { type: 'string' },
          portRange: { type: 'string' },
        },
      },
    });
  });
});

describe('#errorHandling', () => {
  [
    fetchComputeNetworks,
    fetchComputeSubnetworks,
    fetchComputeFirewalls,
  ].forEach((method) => {
    it('should handle setup errors', async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: integrationConfig,
      });
      try {
        await withRecording(
          `${method.name}SetupError`,
          async () => await method(context),
          // Our polly request matching system thinks we don't have this
          // recording even though we do. Never try to recapture.
          { recordIfMissing: false },
        );
        fail(`${method.name} was successful when it should have failed`);
      } catch (error) {
        expect(error).toBeInstanceOf(IntegrationProviderAuthorizationError);
        expect(error.message).toMatch(/disable/i);
      }
    });
    it('should handle billing errors', async () => {
      const context = createMockStepExecutionContext<IntegrationConfig>({
        instanceConfig: integrationConfig,
      });
      try {
        await withRecording(
          `${method.name}BillingError`,
          async () => await method(context),
        );
        fail(`${method.name} was successful when it should have failed`);
      } catch (error) {
        expect(error).toBeInstanceOf(IntegrationProviderAuthorizationError);
        expect(error.message).toMatch(/billing/i);
      }
    });
  });
});
