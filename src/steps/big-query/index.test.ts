import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import {
  buildBigQueryDatasetKMSRelationships,
  fetchBigQueryDatasets,
  fetchBigQueryModels,
  fetchBigQueryTables,
} from '.';
import { integrationConfig } from '../../../test/config';
import { separateDirectMappedRelationships } from '../../../test/helpers/separateDirectMappedRelationships';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchKmsCryptoKeys, fetchKmsKeyRings } from '../kms';
import {
  BIG_QUERY_DATASET_ENTITY_TYPE,
  RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY,
  BIG_QUERY_TABLE_ENTITY_TYPE,
  RELATIONSHIP_TYPE_DATASET_HAS_TABLE,
  BIG_QUERY_MODEL_ENTITY_TYPE,
  RELATIONSHIP_TYPE_DATASET_HAS_MODEL,
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

describe('#fetchBigQueryDatasets', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchBigQueryDatasets',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchBigQueryDatasets(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === BIG_QUERY_DATASET_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore', 'Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigquery_dataset' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          description: { type: 'string' },
          public: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          location: { type: 'string' },
          encrypted: { type: 'boolean' },
          classification: { const: null },
          etag: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });
  });
});

describe('#buildBigQueryDatasetKMSRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildBigQueryDatasetKMSRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should build relationships', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
    await fetchBigQueryDatasets(context);
    await buildBigQueryDatasetKMSRelationships(context);

    const { directRelationships, mappedRelationships } =
      separateDirectMappedRelationships(
        context.jobState.collectedRelationships,
      );

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_bigquery_dataset_uses_kms_crypto_key',
          },
        },
      },
    });

    expect(mappedRelationships.length).toBeGreaterThan(0);

    expect(
      mappedRelationships
        .filter(
          (e) =>
            e._mapping.sourceEntityKey ===
            'j1-gc-integration-dev-v3:sample_dataset_foreign_key',
        )
        .every(
          (mappedRelationship) =>
            mappedRelationship._key ===
            'j1-gc-integration-dev-v3:sample_dataset_foreign_key|uses|projects/vmware-account/locations/global/keyRings/test-key-ring/cryptoKeys/foreign-key',
        ),
    ).toBe(true);
  });
});

describe('#fetchBigQueryModels', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchBigQueryModels',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchBigQueryDatasets(context);
    await fetchBigQueryModels(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === BIG_QUERY_DATASET_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore', 'Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigquery_dataset' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          description: { type: 'string' },
          public: { type: 'boolean' },
          kmsKeyName: { type: 'string' },
          location: { type: 'string' },
          encrypted: { type: 'boolean' },
          classification: { const: null },
          etag: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === BIG_QUERY_MODEL_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: 'Model',
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigquery_model' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          etag: { type: 'string' },
          modelType: { type: 'string' },
          location: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
          expirationTime: { type: 'number' },
          classification: { const: null },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_DATASET_HAS_MODEL,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_bigquery_dataset_has_model',
          },
        },
      },
    });
  });
});

describe('#fetchBigQueryTables', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchBigQueryTables',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchBigQueryDatasets(context);
    await fetchBigQueryTables(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === BIG_QUERY_TABLE_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataCollection'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigquery_table' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          public: { type: 'boolean' },
          type: { type: 'string' },
          friendlyName: { type: 'string' },
          classification: { const: null },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          expirationTime: { type: 'number' },
          kmsKeyName: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_DATASET_HAS_TABLE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_bigquery_dataset_has_table',
          },
        },
      },
    });
  });
});
