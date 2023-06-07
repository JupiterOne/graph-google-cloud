import {
  Recording,
  StepTestConfig,
  createMockStepExecutionContext,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  fetchComputeDisks,
  fetchComputeFirewalls,
  fetchComputeNetworks,
  fetchComputeSubnetworks,
  fetchComputeInstanceGroups,
  fetchComputeHealthChecks,
  fetchComputeBackendBuckets,
  fetchComputeBackendServices,
  fetchComputeLoadBalancers,
  fetchComputeTargetHttpProxies,
  fetchComputeTargetHttpsProxies,
  fetchComputeTargetSslProxies,
  fetchComputeSslPolicies,
  fetchComputeImages,
  buildComputeNetworkPeeringRelationships,
  fetchComputeRegionBackendServices,
  fetchComputeRegionInstanceGroups,
  fetchComputeRegionDisks,
  fetchComputeRegionHealthChecks,
  fetchComputeRegionLoadBalancers,
  fetchComputeRegionTargetHttpProxies,
  fetchComputeRegionTargetHttpsProxies,
  fetchComputeGlobalForwardingRules,
  fetchComputeForwardingRules,
  fetchComputeGlobalAddresses,
  buildDiskImageRelationships,
  buildDiskUsesKmsRelationships,
  buildComputeBackendBucketHasBucketRelationships,
  buildImageUsesKmsRelationships,
} from '.';
import { fetchStorageBuckets } from '../storage';
import { integrationConfig } from '../../../test/config';
import {
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
  RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
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
  ENTITY_TYPE_COMPUTE_IMAGE,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
  ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK,
  ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_ADDRESSES,
} from './constants';
import {
  Entity,
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { fetchKmsCryptoKeys, fetchKmsKeyRings } from '../kms';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import { separateDirectMappedRelationships } from '../../../test/helpers/separateDirectMappedRelationships';
import { StorageEntitiesSpec } from '../storage/constants';
import { invocationConfig } from '../..';

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
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeDisks(context);

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
          regional: { type: 'boolean' },
          zone: { type: 'string' },
          sizeGB: { type: 'string' },
          status: { type: 'string' },
          sourceImage: { type: 'string' },
          sourceImageId: { type: 'string' },
          sourceSnapshot: { type: 'string' },
          sourceSnapshotId: { type: 'string' },
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
          kmsKeyName: { type: 'string' },
          kmsKeyServiceAccount: { type: 'string' },
          kind: { type: 'string' },
          encrypted: true,
          classification: { const: null },
          webLink: { type: 'string' },
        },
      },
    });
  });
});

describe('#buildDiskImageRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildDiskImageRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeImages(context);
    await fetchComputeDisks(context);
    await buildDiskImageRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const computeDiskUsesImageRelationships =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_compute_disk_uses_image',
      );

    expect(computeDiskUsesImageRelationships).toEqual(
      computeDiskUsesImageRelationships.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );
  });
});

describe.skip('#buildDiskUsesKmsRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildDiskUsesKmsRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeDisks(context);
    await fetchComputeRegionDisks(context);
    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
    await buildDiskUsesKmsRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const { directRelationships, mappedRelationships } =
      separateDirectMappedRelationships(
        context.jobState.collectedRelationships,
      );

    const computeDiskUsesKmsKeyRelationships = directRelationships.filter(
      (r) => r._type === 'google_compute_disk_uses_kms_crypto_key',
    );

    expect(computeDiskUsesKmsKeyRelationships).toEqual(
      computeDiskUsesKmsKeyRelationships.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );

    const mappedKmsRelationships = mappedRelationships.filter(
      (r) => r._type === 'google_compute_disk_uses_kms_crypto_key',
    );

    expect(mappedKmsRelationships.length).toBeGreaterThan(0);

    expect(
      mappedKmsRelationships
        .filter(
          (e) => e._mapping.sourceEntityKey === 'disk:8578135375158446695',
        )
        .every(
          (mappedRelationship) =>
            mappedRelationship._key ===
            'disk:8578135375158446695|uses|projects/vmware-account/locations/global/keyRings/test-key-ring/cryptoKeys/foreign-key',
        ),
    ).toBe(true);
  });
});

describe('#fetchComputeRegionDisks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeRegionDisks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionDisks(context);

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
          region: { type: 'string' },
          regional: { type: 'boolean' },
          description: { type: 'string' },
          zone: { type: 'string' },
          sizeGB: { type: 'string' },
          status: { type: 'string' },
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
          sourceSnapshot: { type: 'string' },
          sourceSnapshotId: { type: 'string' },
          isCustomerSuppliedKeysEncrypted: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          kmsKeyServiceAccount: { type: 'string' },
          kind: { type: 'string' },
          encrypted: true,
          classification: { const: null },
          webLink: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchComputeImages', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeImages',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    await fetchComputeImages(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_IMAGE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Image'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_image' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          deprecationState: { type: 'string' },
          deprecated: { type: 'boolean' },
          kind: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string' },
          family: { type: 'string' },
          archivedSizeBytes: { type: 'string' },
          diskSizeGb: { type: 'string' },
          guestOsFeatures: {
            type: 'array',
            items: { type: 'string' },
          },
          licenses: {
            type: 'array',
            items: { type: 'string' },
          },
          labelFingerprint: { type: 'string' },
          licenseCodes: {
            type: 'array',
            items: { type: 'string' },
          },
          'rawDisk.containerType': { type: 'string' },
          'rawDisk.sha1Checksum': { type: 'string' },
          'rawDisk.source': { type: 'string' },
          sourceDisk: { type: 'string' },
          sourceDiskId: { type: 'string' },
          sourceImage: { type: 'string' },
          sourceImageId: { type: 'string' },
          sourceSnapshot: { type: 'string' },
          sourceSnapshotId: { type: 'string' },
          sourceType: { type: 'string' },
          storageLocations: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    });
  });
});

describe.skip('#buildImageUsesKmsRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildImageUsesKmsRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
    await fetchComputeImages(context);
    await buildImageUsesKmsRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const { directRelationships, mappedRelationships } =
      separateDirectMappedRelationships(
        context.jobState.collectedRelationships,
      );

    const computeImageUsesCryptoKeyRelationship = directRelationships.filter(
      (r) => r._type === 'google_compute_image_uses_kms_crypto_key',
    );
    expect(computeImageUsesCryptoKeyRelationship.length).toBeGreaterThanOrEqual(
      0,
    );
    expect(computeImageUsesCryptoKeyRelationship).toEqual(
      computeImageUsesCryptoKeyRelationship.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );

    const mappedKmsRelationships = mappedRelationships.filter(
      (r) => r._type === 'google_compute_image_uses_kms_crypto_key',
    );
    expect(mappedKmsRelationships.length).toBeGreaterThanOrEqual(0);

    expect(
      mappedKmsRelationships
        .filter(
          (e) =>
            e._mapping.sourceEntityKey ===
            'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v3/global/images/mapped-kms-image-example',
        )
        .every(
          (mappedRelationship) =>
            mappedRelationship._key ===
            'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v3/global/images/mapped-kms-image-example|uses|projects/jupiterone-databricks-test/locations/global/keyRings/test-key-ring/cryptoKeys/foreign-key',
        ),
    ).toBe(true);
  });
});

describe('#fetchComputeAddresses', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeAddresses',
      options: {
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
        recordFailedRequests: true,
      },
    });
  });

  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test('Should collect data', async () => {
    const stepTestConfig: StepTestConfig = {
      stepId: STEP_COMPUTE_ADDRESSES,
      instanceConfig: tempNewAccountConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe('#fetchComputeGlobalAddresses', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeGlobalAddresses',
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
    await fetchComputeSubnetworks(context);
    await fetchComputeGlobalAddresses(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['IpAddress'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_global_address' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          kind: { type: 'string' },
          displayName: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          ipAddress: { type: 'string' },
          ipVersion: { type: 'string' },
          addressType: { type: 'string' },
          status: { type: 'string' },
          purpose: { type: 'string' },
          network: { type: 'string' },
          networkTier: { type: 'string' },
          subnetwork: { type: 'string' },
          users: {
            type: 'array',
            items: { type: 'string' },
          },
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_network_has_global_address' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_subnetwork_has_global_address' },
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
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });
  });

  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test('Should collect data', async () => {
    const stepTestConfig: StepTestConfig = {
      stepId: STEP_COMPUTE_INSTANCES,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe('#fetchComputeProject', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeProject',
      options: {
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
        recordFailedRequests: true,
      },
    });
  });

  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test('Should collect data', async () => {
    const stepTestConfig: StepTestConfig = {
      stepId: STEP_COMPUTE_PROJECT,
      instanceConfig: tempNewAccountConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
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
      instanceConfig: tempNewAccountConfig,
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

describe('#buildComputeNetworkPeeringRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildComputeNetworkPeeringRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships, rest: mappedRelationships } =
      filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
        targets: ExplicitRelationship[];
        rest: MappedRelationship[];
      };

    return {
      directRelationships,
      mappedRelationships,
    };
  }

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeNetworks(context);
    await buildComputeNetworkPeeringRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const { directRelationships, mappedRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: { const: 'google_compute_network_connects_network' },
        },
      },
    });

    // Check mapped relationships
    // Very hacky as we don't have this entity (it is from another project)

    expect(
      mappedRelationships.filter(
        (e) => e._mapping.targetEntity.displayName === 'google_compute_network',
      ),
    ).toTargetEntities([
      {
        _type: 'google_compute_network',
        _key: 'https://www.googleapis.com/compute/v1/projects/learned-hour-315416/global/networks/my-first-project-vpc',
      } as Entity,
    ]);
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeBackendBuckets(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === StorageEntitiesSpec.STORAGE_BUCKET._type,
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
          kmsKeyName: { type: 'string' },
          uniformBucketLevelAccess: { type: 'boolean' },
          retentionPolicyEnabled: { type: 'boolean' },
          retentionPeriod: { type: 'string' },
          retentionDate: { type: 'string' },
          public: { type: 'boolean' },
          isSubjectToObjectAcls: { type: 'boolean' },
          classification: { const: null },
          etag: { type: 'string' },
          versioningEnabled: { type: 'boolean' },
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
  });
});

describe('#buildComputeBackendBucketHasBucketRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildComputeBackendBucketHasBucketRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchStorageBuckets(context);
    await fetchComputeBackendBuckets(context);
    await buildComputeBackendBucketHasBucketRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeInstanceGroups(context);
    await fetchComputeHealthChecks(context);
    await fetchComputeBackendServices(context);

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
          regional: { type: 'boolean' },
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
          regional: { type: 'boolean' },
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
          regional: { type: 'boolean' },
          timeoutSec: { type: 'number' },
          port: { type: 'number' },
          protocol: { type: 'string' },
          enableCDN: { type: 'boolean' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
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

describe('#fetchComputeRegionBackendServices', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeRegionBackendServices',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionInstanceGroups(context);
    await fetchComputeRegionHealthChecks(context);
    // It seems region backend service can be connected with these 2 non-regional resources
    await fetchComputeHealthChecks(context);
    await fetchComputeInstanceGroups(context);
    await fetchComputeRegionBackendServices(context);

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
          regional: { type: 'boolean' },
          timeoutSec: { type: 'number' },
          port: { type: 'number' },
          protocol: { type: 'string' },
          enableCDN: { type: 'boolean' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
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
          _type: {
            const: 'google_compute_backend_service_has_instance_group',
          },
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
          _type: {
            const: 'google_compute_backend_service_has_instance_group',
          },
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
          _type: {
            const: 'google_compute_backend_service_has_health_check',
          },
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
          _type: {
            const: 'google_compute_backend_service_has_health_check',
          },
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeHealthChecks(context);

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
          regional: { type: 'boolean' },
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

describe('#fetchComputeRegionHealthChecks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeRegionHealthChecks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionHealthChecks(context);

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
          regional: { type: 'boolean' },
          description: { type: 'string' },
          checkIntervalSec: { type: 'number' },
          timeoutSec: { type: 'number' },
          unhealthyThreshold: { type: 'number' },
          healthyThreshold: { type: 'number' },
          region: { type: 'string' },
          type: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
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
          regional: { type: 'boolean' },
          network: { type: 'string' },
          zone: { type: 'string' },
          subnetwork: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_compute_instance_group_has_named_port',
          },
        },
      },
    });
  });
});

describe('#fetchComputeRegionInstanceGroups', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeRegionInstanceGroups',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionInstanceGroups(context);

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
          regional: { type: 'boolean' },
          network: { type: 'string' },
          zone: { type: 'string' },
          subnetwork: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_compute_instance_group_has_named_port',
          },
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeBackendServices(context);
    await fetchComputeBackendBuckets(context);
    await fetchComputeLoadBalancers(context);

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
          regional: { type: 'boolean' },
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
          regional: { type: 'boolean' },
          defaultService: { type: 'string' },
          description: { type: 'string' },
          kind: { type: 'string' },
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

describe('#fetchComputeRegionLoadBalancers', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeRegionLoadBalancers',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionBackendServices(context);
    await fetchComputeRegionLoadBalancers(context);

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
          regional: { type: 'boolean' },
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
          regional: { type: 'boolean' },
          defaultService: { type: 'string' },
          description: { type: 'string' },
          kind: { type: 'string' },
          region: { type: 'string' },
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeLoadBalancers(context);
    await fetchComputeTargetHttpProxies(context);

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
          regional: { type: 'boolean' },
          defaultService: { type: 'string' },
          kind: { type: 'string' },
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
          regional: { type: 'boolean' },
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

describe('#fetchComputeRegionTargetHttpProxies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeRegionTargetHttpProxies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionLoadBalancers(context);
    await fetchComputeRegionTargetHttpProxies(context);

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
          regional: { type: 'boolean' },
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
          regional: { type: 'boolean' },
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
          _type: {
            const: 'google_compute_url_map_has_target_http_proxy',
          },
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeLoadBalancers(context);
    await fetchComputeTargetHttpsProxies(context);

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
          regional: { type: 'boolean' },
          defaultService: { type: 'string' },
          kind: { type: 'string' },
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
          regional: { type: 'boolean' },
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

describe('#fetchComputeRegionTargetHttpsProxies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeRegionTargetHttpsProxies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionLoadBalancers(context);
    await fetchComputeRegionTargetHttpsProxies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

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
          regional: { type: 'boolean' },
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
          _type: {
            const: 'google_compute_url_map_has_target_https_proxy',
          },
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeBackendServices(context);
    await fetchComputeTargetSslProxies(context);

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
          regional: { type: 'boolean' },
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchComputeTargetSslProxies(context);
    await fetchComputeTargetHttpsProxies(context);
    await fetchComputeSslPolicies(context);

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
          regional: { type: 'boolean' },
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

describe('#fetchComputeGlobalForwardingRules', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeGlobalForwardingRules',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeBackendServices(context);
    await fetchComputeNetworks(context);
    await fetchComputeSubnetworks(context);
    await fetchComputeTargetHttpProxies(context);
    await fetchComputeTargetHttpsProxies(context);
    await fetchComputeGlobalForwardingRules(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_global_forwarding_rule' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          kind: { type: 'string' },
          displayName: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          ipAddress: { type: 'string' },
          ipProtocol: { type: 'string' },
          portRange: { type: 'string' },
          ports: {
            type: 'array',
            items: { type: 'string' },
          },
          pscConnectionId: { type: 'string' },
          serviceName: { type: 'string' },
          loadBalancingScheme: { type: 'string' },
          isMirroringCollector: { type: 'boolean' },
          networkTier: { type: 'string' },
          allPorts: { type: 'boolean' },
          allowGlobalAccess: { type: 'boolean' },
          subnetwork: { type: 'string' },
          network: { type: 'string' },
          backendService: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const:
              'google_compute_global_forwarding_rule_connects_backend_service',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const: 'google_compute_global_forwarding_rule_connects_subnetwork',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const: 'google_compute_global_forwarding_rule_connects_network',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const:
              'google_compute_global_forwarding_rule_connects_target_http_proxy',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const:
              'google_compute_global_forwarding_rule_connects_target_https_proxy',
          },
        },
      },
    });
  });
});

describe('#fetchComputeForwardingRules', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeForwardingRules',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeRegionBackendServices(context);
    await fetchComputeNetworks(context);
    await fetchComputeSubnetworks(context);
    await fetchComputeRegionTargetHttpProxies(context);
    await fetchComputeRegionTargetHttpsProxies(context);
    await fetchComputeForwardingRules(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_forwarding_rule' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          kind: { type: 'string' },
          displayName: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          ipAddress: { type: 'string' },
          ipProtocol: { type: 'string' },
          portRange: { type: 'string' },
          ports: {
            type: 'array',
            items: { type: 'string' },
          },
          pscConnectionId: { type: 'string' },
          serviceName: { type: 'string' },
          loadBalancingScheme: { type: 'string' },
          isMirroringCollector: { type: 'boolean' },
          networkTier: { type: 'string' },
          allPorts: { type: 'boolean' },
          allowGlobalAccess: { type: 'boolean' },
          subnetwork: { type: 'string' },
          network: { type: 'string' },
          backendService: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const: 'google_compute_forwarding_rule_connects_backend_service',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const: 'google_compute_forwarding_rule_connects_subnetwork',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: { const: 'google_compute_forwarding_rule_connects_network' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const: 'google_compute_forwarding_rule_connects_target_http_proxy',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const: 'google_compute_forwarding_rule_connects_target_https_proxy',
          },
        },
      },
    });
  });
});

// describe('#errorHandling', () => {
//   [
//     fetchComputeNetworks,
//     fetchComputeSubnetworks,
//     fetchComputeFirewalls,
//   ].forEach((method) => {
//     it('should handle setup errors', async () => {
//       const customConfig = {
//         ...integrationConfig,
//         serviceAccountKeyConfig: {
//           ...integrationConfig.serviceAccountKeyConfig,
//           project_id: 'j1-gc-integration-dev',
//         },
//       };
//       const context = createMockStepExecutionContext<IntegrationConfig>({
//         instanceConfig: customConfig,
//       });
//       try {
//         await withRecording(
//           `${method.name}SetupError`,
//           __dirname,
//           async () => await method(context),
//         );
//         fail(`${method.name} was successful when it should have failed`);
//       } catch (error) {
//         expect(error).toBeInstanceOf(IntegrationProviderAuthorizationError);
//         expect(error.message).toMatch(/disable/i);
//       }
//     });
//     it('should handle billing errors', async () => {
//       const customConfig = {
//         ...integrationConfig,
//         serviceAccountKeyConfig: {
//           ...integrationConfig.serviceAccountKeyConfig,
//           project_id: 'j1-gc-integration-dev',
//         },
//       };
//       const context = createMockStepExecutionContext<IntegrationConfig>({
//         instanceConfig: customConfig,
//       });
//       try {
//         await withRecording(
//           `${method.name}BillingError`,
//           __dirname,
//           async () => await method(context),
//         );
//         fail(`${method.name} was successful when it should have failed`);
//       } catch (error) {
//         expect(error).toBeInstanceOf(IntegrationProviderAuthorizationError);
//         expect(error.message).toMatch(/billing/i);
//       }
//     });
//   });
// });
