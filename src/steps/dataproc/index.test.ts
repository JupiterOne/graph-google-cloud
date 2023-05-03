import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  createClusterStorageRelationships,
  createClusterImageRelationships,
  fetchDataprocClusters,
  buildDataprocClusterUsesKmsRelationships,
} from '.';
import {
  ENTITY_TYPE_DATAPROC_CLUSTER,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_COMPUTE_IMAGE,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_STORAGE_BUCKET,
} from './constants';
import { fetchKmsCryptoKeys, fetchKmsKeyRings } from '../kms';
import { fetchStorageBuckets } from '../storage';
import { ENTITY_TYPE_COMPUTE_IMAGE, fetchComputeImages } from '../compute';
import { separateDirectMappedRelationships } from '../../../test/helpers/separateDirectMappedRelationships';
import { omitNewRegionsFromTests } from '../../../test/regions';
import { StorageEntitiesSpec } from '../storage/constants';

beforeAll(() => omitNewRegionsFromTests());

describe('#fetchDataprocClusters', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchDataprocClusters',
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

    await fetchDataprocClusters(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_DATAPROC_CLUSTER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Cluster'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_dataproc_cluster' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          status: { type: 'string' },
          configBucket: { type: 'string' },
          tempBucket: { type: 'string' },
          zoneUri: { type: 'string' },
          networkUri: { type: 'string' },
          masterConfigNumInstances: { type: 'number' },
          masterConfigImageUri: { type: 'string' },
          masterConfigMachineTypeUri: { type: 'string' },
          masterConfigMinCpuPlatform: { type: 'string' },
          masterConfigPreemptibility: { type: 'string' },
          workerConfigNumInstances: { type: 'number' },
          workerConfigImageUri: { type: 'string' },
          workerConfigMachineTypeUri: { type: 'string' },
          workerConfigMinCpuPlatform: { type: 'string' },
          workerConfigPreemptibility: { type: 'string' },
          softwareConfigImageVersion: { type: 'string' },
          enableKerberos: { type: 'string' },
          rootPrincipalPasswordUri: { type: 'string' },
          kmsKeyUri: { type: 'string' },
          keystoreUri: { type: 'string' },
          truststoreUri: { type: 'string' },
          keystorePasswordUri: { type: 'string' },
          keyPasswordUri: { type: 'string' },
          truststorePasswordUri: { type: 'string' },
          crossRealmTrustRealm: { type: 'string' },
          crossRealmTrustKdc: { type: 'string' },
          crossRealmTrustAdminServer: { type: 'string' },
          crossRealmTrustSharedPasswordUri: { type: 'string' },
          kdcDbKeyUri: { type: 'string' },
          tgtLifetimeHours: { type: 'string' },
          realm: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });
  });
});

describe.skip('#buildDataprocClusterUsesKmsRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildDataprocClusterUsesKmsRelationships',
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
    await fetchDataprocClusters(context);
    await buildDataprocClusterUsesKmsRelationships(context);

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

    const clusterUsesKMSDirectRelationships = directRelationships.filter(
      (r) => r._type === RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
    );
    expect(clusterUsesKMSDirectRelationships.length).toBeGreaterThan(0);
    expect(clusterUsesKMSDirectRelationships).toEqual(
      clusterUsesKMSDirectRelationships.map((r) =>
        expect.objectContaining({
          _class: 'USES',
        }),
      ),
    );

    const clusterUsesKMSMappedRelationships = mappedRelationships.filter(
      (r) => r._type === RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
    );
    expect(clusterUsesKMSMappedRelationships.length).toBeGreaterThan(0);
    expect(
      clusterUsesKMSMappedRelationships
        .filter(
          (e) =>
            e._mapping.sourceEntityKey ===
            'projects/j1-gc-integration-dev-v3/regions/us-central1/clusters/cluster-5697',
        )
        .every(
          (mappedRelationship) =>
            mappedRelationship._key ===
            'projects/j1-gc-integration-dev-v3/regions/us-central1/clusters/cluster-5697|uses|projects/jupiterone-databricks-test/locations/us-central1/keyRings/test-key-ring/cryptoKeys/foreign-key',
        ),
    ).toBe(true);
  });
});

describe('#createClusterImageRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'createClusterImageRelationships',
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

    await fetchDataprocClusters(context);
    await fetchComputeImages(context);
    await createClusterImageRelationships(context);

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

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_DATAPROC_CLUSTER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Cluster'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_dataproc_cluster' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          status: { type: 'string' },
          configBucket: { type: 'string' },
          tempBucket: { type: 'string' },
          zoneUri: { type: 'string' },
          networkUri: { type: 'string' },
          masterConfigNumInstances: { type: 'number' },
          masterConfigImageUri: { type: 'string' },
          masterConfigMachineTypeUri: { type: 'string' },
          masterConfigMinCpuPlatform: { type: 'string' },
          masterConfigPreemptibility: { type: 'string' },
          workerConfigNumInstances: { type: 'number' },
          workerConfigImageUri: { type: 'string' },
          workerConfigMachineTypeUri: { type: 'string' },
          workerConfigMinCpuPlatform: { type: 'string' },
          workerConfigPreemptibility: { type: 'string' },
          softwareConfigImageVersion: { type: 'string' },
          enableKerberos: { type: 'string' },
          rootPrincipalPasswordUri: { type: 'string' },
          kmsKeyUri: { type: 'string' },
          keystoreUri: { type: 'string' },
          truststoreUri: { type: 'string' },
          keystorePasswordUri: { type: 'string' },
          keyPasswordUri: { type: 'string' },
          truststorePasswordUri: { type: 'string' },
          crossRealmTrustRealm: { type: 'string' },
          crossRealmTrustKdc: { type: 'string' },
          crossRealmTrustAdminServer: { type: 'string' },
          crossRealmTrustSharedPasswordUri: { type: 'string' },
          kdcDbKeyUri: { type: 'string' },
          tgtLifetimeHours: { type: 'string' },
          realm: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_COMPUTE_IMAGE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_dataproc_cluster_uses_compute_image',
          },
        },
      },
    });
  });
});

describe('#createClusterStorageRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'createClusterStorageRelationships',
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

    await fetchDataprocClusters(context);
    await fetchStorageBuckets(context);
    await createClusterStorageRelationships(context);

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
          access: { type: 'string' },
          isSubjectToObjectAcls: { type: 'boolean' },
          classification: { const: null },
          etag: { type: 'string' },
          versioningEnabled: { type: 'boolean' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_DATAPROC_CLUSTER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Cluster'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_dataproc_cluster' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: { type: 'string' },
          name: { type: 'string' },
          encrypted: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          status: { type: 'string' },
          configBucket: { type: 'string' },
          tempBucket: { type: 'string' },
          zoneUri: { type: 'string' },
          networkUri: { type: 'string' },
          masterConfigNumInstances: { type: 'number' },
          masterConfigImageUri: { type: 'string' },
          masterConfigMachineTypeUri: { type: 'string' },
          masterConfigMinCpuPlatform: { type: 'string' },
          masterConfigPreemptibility: { type: 'string' },
          workerConfigNumInstances: { type: 'number' },
          workerConfigImageUri: { type: 'string' },
          workerConfigMachineTypeUri: { type: 'string' },
          workerConfigMinCpuPlatform: { type: 'string' },
          workerConfigPreemptibility: { type: 'string' },
          softwareConfigImageVersion: { type: 'string' },
          enableKerberos: { type: 'string' },
          rootPrincipalPasswordUri: { type: 'string' },
          kmsKeyUri: { type: 'string' },
          keystoreUri: { type: 'string' },
          truststoreUri: { type: 'string' },
          keystorePasswordUri: { type: 'string' },
          keyPasswordUri: { type: 'string' },
          truststorePasswordUri: { type: 'string' },
          crossRealmTrustRealm: { type: 'string' },
          crossRealmTrustKdc: { type: 'string' },
          crossRealmTrustAdminServer: { type: 'string' },
          crossRealmTrustSharedPasswordUri: { type: 'string' },
          kdcDbKeyUri: { type: 'string' },
          tgtLifetimeHours: { type: 'string' },
          realm: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_STORAGE_BUCKET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_dataproc_cluster_uses_storage_bucket',
          },
        },
      },
    });
  });
});
