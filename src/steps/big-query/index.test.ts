import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchBigQueryDatasets, fetchBigQueryTables } from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchKmsCryptoKeys, fetchKmsKeyRings } from '../kms';
import {
  BIG_QUERY_DATASET_ENTITY_TYPE,
  RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY,
  BIG_QUERY_TABLE_ENTITY_TYPE,
  RELATIONSHIP_TYPE_DATASET_HAS_TABLE,
} from './constants';

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
      instanceConfig: integrationConfig,
    });

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
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

    expect(
      context.jobState.collectedRelationships.filter(
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
      instanceConfig: integrationConfig,
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
      _class: ['DataObject'],
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
