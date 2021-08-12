import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchDataprocClusters } from '.';
import {
  ENTITY_TYPE_DATAPROC_CLUSTER,
  RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
} from './constants';
import {
  ENTITY_TYPE_KMS_KEY,
  fetchKmsCryptoKeys,
  fetchKmsKeyRings,
} from '../kms';

jest.setTimeout(500000);

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

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
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
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_DATAPROC_CLUSTER_USES_KMS_CRYPTO_KEY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_dataproc_cluster_uses_kms_crypto_key',
          },
        },
      },
    });
  });
});
