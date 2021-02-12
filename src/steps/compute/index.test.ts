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
  fetchComputeProject,
  fetchComputeInstanceGroups,
  fetchHealthChecks,
  fetchBackendBuckets,
  fetchBackendServices,
  fetchLoadBalancers,
  fetchTargetHttpProxies,
  fetchTargetHttpsProxies,
  fetchTargetSslProxies,
  fetchSslPolicies,
} from '.';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  fetchStorageBuckets,
} from '../storage';
import {
  integrationConfig,
  setupErrorIntegrationConfig,
} from '../../../test/config';
import {
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
  RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
  RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
  RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_BUCKET,
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_TARGET_SSL_PROXY,
  ENTITY_TYPE_COMPUTE_SSL_POLICY,
  RELATIONSHIP_TYPE_TARGET_HTTPS_PROXY_HAS_SSL_POLICY,
  RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_COMPUTE_INSTANCE,
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
          isCustomerSuppliedKeysEncrypted: { type: 'boolean' },
          kind: { type: 'string' },
          encrypted: true,
          classification: { const: null },
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
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchComputeInstanceGroups(context);
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
          isCustomerSuppliedKeysEncrypted: { type: 'boolean' },
          kind: { type: 'string' },
          encrypted: true,
          classification: { const: null },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Group'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_instance_group' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          network: { type: 'string' },
          zone: { type: 'string' },
          subnetwork: { type: 'string' },
          createdOn: { type: 'number' },
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
          usesDefaultServiceAccount: { type: 'boolean' },
          usesFullAccessDefaultServiceAccount: { type: 'boolean' },
          blockProjectSSHKeys: { type: 'boolean' },
          isSerialPortEnabled: { type: 'boolean' },
          isShieldedVM: { type: 'boolean' },
          isOSLoginEnabled: { type: 'boolean' },
          labelFingerprint: { type: 'string' },
          startRestricted: { type: 'boolean' },
          deletionProtection: { type: 'boolean' },
          fingerprint: { type: 'string' },
          kind: { type: 'string' },
          publicIpAddress: {
            type: 'array',
            items: { type: 'string' },
          },
          privateIpAddress: {
            type: 'array',
            items: { type: 'string' },
          },
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

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_COMPUTE_INSTANCE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_instance_group_has_instance' },
        },
      },
    });
  });
});

describe('#fetchComputeProject', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeProject',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchComputeInstanceGroups(context);
    await fetchComputeInstances(context);
    await fetchComputeProject(context);

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
          usesDefaultServiceAccount: { type: 'boolean' },
          usesFullAccessDefaultServiceAccount: { type: 'boolean' },
          blockProjectSSHKeys: { type: 'boolean' },
          isSerialPortEnabled: { type: 'boolean' },
          isShieldedVM: { type: 'boolean' },
          isOSLoginEnabled: { type: 'boolean' },
          labelFingerprint: { type: 'string' },
          startRestricted: { type: 'boolean' },
          deletionProtection: { type: 'boolean' },
          fingerprint: { type: 'string' },
          kind: { type: 'string' },
          publicIpAddress: {
            type: 'array',
            items: { type: 'string' },
          },
          privateIpAddress: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_PROJECT,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Project'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          displayName: { type: 'string' },
          isOSLoginEnabled: { type: 'boolean' },
          name: { type: 'string' },
          kind: { type: 'string' },
          defaultServiceAccount: { type: 'string' },
          defaultNetworkTier: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_project_has_instance' },
        },
      },
    });
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_NETWORK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Network'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_network' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          displayName: { type: 'string' },
          description: { type: 'string' },
          name: { type: 'string' },
          createdOn: { type: 'number' },
          routingMode: { type: 'string' },
          autoCreateSubnetworks: { type: 'boolean' },
          subnetworks: {
            type: 'array',
            items: { type: 'string' },
          },
          gatewayIPv4: { type: 'string' },
          IPv4Range: { type: 'string' },
          public: { type: 'boolean' },
          internal: { type: 'boolean' },
          CIDR: { const: null },
          webLink: { type: 'string' },
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
          flowLogsEnabled: { type: 'boolean' },
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

describe('#fetchComputeBackendBuckets', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeBackendBuckets',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchStorageBuckets(context);
    await fetchBackendBuckets(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_storage_bucket' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          storageClass: { type: 'string' },
          encrypted: { const: true },
          encryptionKeyRef: { type: 'string' },
          uniformBucketLevelAccess: { type: 'boolean' },
          retentionPolicyEnabled: { type: 'boolean' },
          retentionPeriod: { type: 'string' },
          retentionDate: { type: 'string' },
          public: { type: 'boolean' },
          classification: { const: null },
          etag: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_backend_bucket' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          bucketName: { type: 'string' },
          enableCdn: { type: 'boolean' },
          encrypted: { const: true },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_backend_bucket_has_storage_bucket' },
        },
      },
    });
  });
});

describe('#fetchComputeBackendServices', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeBackendServices',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchComputeInstanceGroups(context);
    await fetchHealthChecks(context);
    await fetchBackendServices(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Group'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_instance_group' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          network: { type: 'string' },
          zone: { type: 'string' },
          subnetwork: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_health_check' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          checkIntervalSec: { type: 'number' },
          timeoutSec: { type: 'number' },
          unhealthyThreshold: { type: 'number' },
          healthyThreshold: { type: 'number' },
          type: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_backend_service' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          timeoutSec: { type: 'number' },
          port: { type: 'number' },
          protocol: { type: 'string' },
          enableCDN: { type: 'boolean' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_backend_service_has_instance_group' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_backend_service_has_health_check' },
        },
      },
    });
  });
});

describe('#fetchComputeHealthChecks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeHealthChecks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchHealthChecks(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_health_check' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          checkIntervalSec: { type: 'number' },
          timeoutSec: { type: 'number' },
          unhealthyThreshold: { type: 'number' },
          healthyThreshold: { type: 'number' },
          type: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          createdOn: { type: 'number' },
        },
      },
    });
  });
});

describe('#fetchComputeInstanceGroups', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeInstanceGroups',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchComputeInstanceGroups(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Group'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_instance_group' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          network: { type: 'string' },
          zone: { type: 'string' },
          subnetwork: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });
  });
});

describe('#fetchComputeLoadBalancers', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeLoadBalancers',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchBackendServices(context);
    await fetchBackendBuckets(context);
    await fetchLoadBalancers(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_backend_service' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          timeoutSec: { type: 'number' },
          port: { type: 'number' },
          protocol: { type: 'string' },
          enableCDN: { type: 'boolean' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_backend_bucket' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          bucketName: { type: 'string' },
          enableCdn: { type: 'boolean' },
          encrypted: { const: true },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_url_map' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          defaultService: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_url_map_has_backend_service' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_BUCKET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_url_map_has_backend_bucket' },
        },
      },
    });
  });
});

describe('#fetchComputeTargetHttpProxies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeTargetHttpProxies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchLoadBalancers(context);
    await fetchTargetHttpProxies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_url_map' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          defaultService: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_target_http_proxy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_url_map_has_target_http_proxy' },
        },
      },
    });
  });
});

describe('#fetchComputeTargetHttpsProxies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeTargetHttpsProxies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchLoadBalancers(context);
    await fetchTargetHttpsProxies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_url_map' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          defaultService: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_target_https_proxy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          sslPolicy: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_url_map_has_target_https_proxy' },
        },
      },
    });
  });
});

describe('#fetchComputeTargetSslProxies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeTargetSslProxies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchBackendServices(context);
    await fetchTargetSslProxies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_backend_service' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          timeoutSec: { type: 'number' },
          port: { type: 'number' },
          protocol: { type: 'string' },
          enableCDN: { type: 'boolean' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_target_ssl_proxy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          sslPolicy: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_TARGET_SSL_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_compute_backend_service_has_target_ssl_proxy',
          },
        },
      },
    });
  });
});

describe('#fetchComputeSslPolicies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeSslPolicies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
    });

    await fetchTargetSslProxies(context);
    await fetchTargetHttpsProxies(context);
    await fetchSslPolicies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_target_ssl_proxy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          sslPolicy: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_target_https_proxy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          sslPolicy: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_SSL_POLICY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Policy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_ssl_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          minTlsVersion: { type: 'string' },
          profile: { type: 'string' },
          customFeatures: {
            type: 'array',
            items: { type: 'string' },
          },
          title: { type: 'string' },
          summary: { type: 'string' },
          content: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_TARGET_HTTPS_PROXY_HAS_SSL_POLICY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_target_https_proxy_has_ssl_policy' },
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
        instanceConfig: setupErrorIntegrationConfig,
      });
      try {
        await withRecording(
          `${method.name}SetupError`,
          __dirname,
          async () => await method(context),
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
          __dirname,
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
