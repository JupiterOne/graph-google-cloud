jest.setTimeout(120000);

import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import {
  setupGoogleCloudRecording,
  // withRecording,
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
  fetchComputeAddresses,
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
} from '.';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  fetchStorageBuckets,
} from '../storage';
import {
  integrationConfig,
  // setupErrorIntegrationConfig,
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
  ENTITY_TYPE_COMPUTE_IMAGE,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
  ENTITY_TYPE_COMPUTE_ADDRESS,
  ENTITY_TYPE_COMPUTE_REGION_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_REGION_DISK,
  ENTITY_TYPE_COMPUTE_REGION_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_REGION_LOAD_BALANCER,
  RELATIONSHIP_TYPE_REGION_LOAD_BALANCER_HAS_REGION_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
  RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_REGION_INSTANCE_GROUP,
  RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_REGION_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_REGION_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_REGION_LOAD_BALANCER_HAS_REGION_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_REGION_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_REGION_LOAD_BALANCER_HAS_REGION_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_REGION_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_REGION_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_REGION_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_INSTANCE_USES_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_USES_ADDRESS,
  ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS,
} from './constants';
import {
  Entity,
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
  // IntegrationProviderAuthorizationError,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { fetchIamServiceAccounts } from '../iam';
import {
  ENTITY_TYPE_KMS_KEY,
  fetchKmsCryptoKeys,
  fetchKmsKeyRings,
} from '../kms';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';

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

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
    await fetchComputeImages(context);
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

    const computeDiskUsesKmsKeyRelationships =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_compute_disk_uses_kms_crypto_key',
      );

    expect(computeDiskUsesKmsKeyRelationships).toEqual(
      computeDiskUsesKmsKeyRelationships.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );
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

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_DISK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore', 'Disk'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_disk' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          region: { type: 'string' },
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

    const computeRegionDiskUsesKmsKeyRelationships =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_compute_region_disk_uses_kms_crypto_key',
      );

    expect(computeRegionDiskUsesKmsKeyRelationships).toEqual(
      computeRegionDiskUsesKmsKeyRelationships.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );
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
      instanceConfig: integrationConfig,
    });

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
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
        (e) => e._type === ENTITY_TYPE_KMS_KEY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Key', 'CryptoKey'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_kms_crypto_key' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          location: { type: 'string' },
          shortName: { type: 'string' },
          purpose: { type: 'string' },
          keyUsage: { type: 'string' },
          nextRotationTime: { type: 'number' },
          rotationPeriod: { type: 'number' },
          protectionLevel: { type: 'string' },
          algorithm: { type: 'string' },
          public: { type: 'boolean' },
          primaryName: { type: 'string' },
          primaryState: { type: 'string' },
          primaryCreateTime: { type: 'number' },
          primaryProtectionLevel: { type: 'string' },
          primaryAlgorithm: { type: 'string' },
          primaryGenerateTime: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_IMAGE,
      ),
    ).toMatchGraphObjectSchema({
      _class: 'Image',
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

    const computeImageUsesCryptoKeyRelationship =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_compute_image_uses_kms_crypto_key',
      );

    expect(computeImageUsesCryptoKeyRelationship).toEqual(
      computeImageUsesCryptoKeyRelationship.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );
  });
});

describe('#fetchComputeAddresses', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchComputeAddresses',
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
    await fetchComputeInstances(context);
    await fetchComputeForwardingRules(context);
    await fetchComputeAddresses(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_COMPUTE_ADDRESS,
      ),
    ).toMatchGraphObjectSchema({
      _class: 'IpAddress',
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_address' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          kind: { type: 'string' },
          projectId: { type: 'string' },
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
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ADDRESS,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_network_has_address' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_ADDRESS,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_subnetwork_has_address' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_COMPUTE_INSTANCE_USES_ADDRESS,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_compute_instance_uses_address' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_USES_ADDRESS,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_compute_forwarding_rule_uses_address' },
        },
      },
    });
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
      _class: 'IpAddress',
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
          connectedNetworksCount: { type: 'number' },
          isSerialPortEnabled: { type: 'boolean' },
          isShieldedVM: { type: 'boolean' },
          integrityMonitoringEnabled: { type: 'boolean' },
          secureBootEnabled: { type: 'boolean' },
          vtpmEnabled: { type: 'boolean' },
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
          serviceAccountEmails: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    const computeInstanceUsesDiskRelationship =
      context.jobState.collectedRelationships.filter(
        (r) => r._type === 'google_compute_instance_uses_disk',
      );

    expect(computeInstanceUsesDiskRelationship).toEqual(
      computeInstanceUsesDiskRelationship.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );

    const computeInstanceTrustsServiceAccountRelationship =
      context.jobState.collectedRelationships.filter(
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
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
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
          connectedNetworksCount: { type: 'number' },
          isSerialPortEnabled: { type: 'boolean' },
          isShieldedVM: { type: 'boolean' },
          integrityMonitoringEnabled: { type: 'boolean' },
          secureBootEnabled: { type: 'boolean' },
          vtpmEnabled: { type: 'boolean' },
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
          serviceAccountEmails: {
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
    ).toCreateValidRelationshipsToEntities([
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
      instanceConfig: integrationConfig,
    });

    await fetchStorageBuckets(context);
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
          kmsKeyName: { type: 'string' },
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_BACKEND_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_backend_service' },
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
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_REGION_INSTANCE_GROUP,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_compute_region_backend_service_has_region_instance_group',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_compute_region_backend_service_has_instance_group',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_REGION_HEALTH_CHECK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_compute_region_backend_service_has_region_health_check',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_REGION_BACKEND_SERVICE_HAS_HEALTH_CHECK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_compute_region_backend_service_has_health_check',
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_HEALTH_CHECK,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_health_check' },
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
          network: { type: 'string' },
          zone: { type: 'string' },
          subnetwork: { type: 'string' },
          createdOn: { type: 'number' },
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_BACKEND_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_backend_service' },
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_LOAD_BALANCER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_url_map' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
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
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_REGION_LOAD_BALANCER_HAS_REGION_BACKEND_SERVICE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_compute_region_url_map_has_backend_service' },
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_BACKEND_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_backend_service' },
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_TARGET_HTTP_PROXY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_target_http_proxy' },
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
          e._type ===
          RELATIONSHIP_TYPE_REGION_LOAD_BALANCER_HAS_REGION_TARGET_HTTP_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_compute_region_url_map_has_target_http_proxy',
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
        (e) => e._type === ENTITY_TYPE_COMPUTE_REGION_TARGET_HTTPS_PROXY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_compute_region_target_https_proxy' },
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
          e._type ===
          RELATIONSHIP_TYPE_REGION_LOAD_BALANCER_HAS_REGION_TARGET_HTTPS_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              'google_compute_region_url_map_has_region_target_https_proxy',
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
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_REGION_BACKEND_SERVICE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const:
              'google_compute_forwarding_rule_connects_region_backend_service',
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
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_REGION_TARGET_HTTP_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const:
              'google_compute_forwarding_rule_connects_region_target_http_proxy',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_REGION_TARGET_HTTPS_PROXY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CONNECTS' },
          _type: {
            const:
              'google_compute_forwarding_rule_connects_region_target_https_proxy',
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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toCreateValidRelationshipsToEntities(entities: Entity[]): R;
    }
  }
}

expect.extend({
  toCreateValidRelationshipsToEntities(
    mappedRelationships: MappedRelationship[],
    entities: Entity[],
  ) {
    for (const mappedRelationship of mappedRelationships) {
      const _mapping = mappedRelationship._mapping;
      if (!_mapping) {
        throw new Error(
          'expect(mappedRelationships).toCreateValidRelationshipsToEntities() requires relationships with the `_mapping` property!',
        );
      }
      const targetEntity = _mapping.targetEntity;
      for (let targetFilterKey of _mapping.targetFilterKeys) {
        /* type TargetFilterKey = string | string[]; */
        if (!Array.isArray(targetFilterKey)) {
          console.warn(
            'WARNING: Found mapped relationship with targetFilterKey of type string. Please ensure the targetFilterKey was not intended to be of type string[]',
          );
          targetFilterKey = [targetFilterKey];
        }
        const mappingTargetEntities = entities.filter((entity) =>
          (targetFilterKey as string[]).every(
            (k) => targetEntity[k] === entity[k],
          ),
        );

        if (mappingTargetEntities.length === 0) {
          return {
            message: () =>
              `No target entity found for mapped relationship: ${JSON.stringify(
                mappedRelationship,
                null,
                2,
              )}`,
            pass: false,
          };
        } else if (mappingTargetEntities.length > 1) {
          return {
            message: () =>
              `Multiple target entities found for mapped relationship [${mappingTargetEntities.map(
                (e) => e._key,
              )}]; expected exactly one: ${JSON.stringify(
                mappedRelationship,
                null,
                2,
              )}`,
            pass: false,
          };
        }
      }
    }
    return {
      message: () => '',
      pass: true,
    };
  },
});
