import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchKmsKeyRings, fetchKmsCryptoKeys } from '.';
import { integrationConfig } from '../../../test/config';
import {
  ENTITY_TYPE_KMS_KEY,
  RELATIONSHIP_TYPE_KMS_KEY_RING_HAS_KMS_KEY,
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

describe('#fetchKmsKeyRings', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchKmsKeyRings',
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

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ['Vault'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_kms_key_ring' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          location: { type: 'string' },
          shortName: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchKmsCryptoKeys', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchKmsCryptoKeys',
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

    const keyRingKeyRelationships =
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_KMS_KEY_RING_HAS_KMS_KEY,
      );

    expect(keyRingKeyRelationships.length).toBeGreaterThan(0);
    expect(keyRingKeyRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_kms_key_ring_has_crypto_key' },
        },
      },
    });
  });
});

// describe('#errorHandling', () => {
//   [fetchKmsKeyRings].forEach((method) => {
//     it('should handle billing errors correctly', async () => {
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
