import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import {
  buildBigQueryDatasetKMSRelationships,
  fetchBigQueryDatasets,
  fetchBigQueryModels,
  fetchBigQueryTables,
  handleDatasetError,
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
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

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

describe('#fetchBigQueryDatasets - GoogleCloudServiceApiDisabledError', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchBigQueryDatasets:serviceApiDisabled',
      options: {
        recordFailedRequests: true,
      },
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should not throw if the project has not enabled BigQuery', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        projectId: 'jupiter-dev-326616',
      },
    });

    await expect(fetchBigQueryDatasets(context)).resolves.toBeUndefined();

    expect(context.jobState.collectedEntities).toHaveLength(0);
  });
});

describe.skip('#buildBigQueryDatasetKMSRelationships', () => {
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

    expect(mappedRelationships.length).toBeGreaterThanOrEqual(0);

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
      _class: ['Model'],
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
describe('handleDatasetError', () => {
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: tempNewAccountConfig,
  });

  test('Should throw if error is not 404', () => {
    const method = () => {
      try {
        throw new IntegrationProviderAPIError({
          endpoint: 'tables',
          status: '403',
          statusText: 'Forbidden',
        });
      } catch (error) {
        handleDatasetError(error, 'resource', 'dataset', context.logger);
      }
    };
    expect(method).toThrow(IntegrationProviderAPIError);
  });
  test('Should throw if error is not IntegrationProviderAPIError', () => {
    const method = () => {
      try {
        throw new Error('Error');
      } catch (error) {
        handleDatasetError(error, 'resource', 'dataset', context.logger);
      }
    };
    expect(method).toThrow(Error);
  });
  test('Should not throw if error is 404', () => {
    const spy = jest.spyOn(context.logger, 'warn');
    const err = new IntegrationProviderAPIError({
      endpoint: 'tables',
      status: '404',
      statusText: 'Forbidden',
    });
    const datasetName = 'dataset';
    const resourceDescription = 'resource';
    const method = () => {
      try {
        throw err;
      } catch (error) {
        handleDatasetError(error, 'resource', datasetName, context.logger);
      }
    };
    method();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      { error: err, dataset: datasetName },
      `Unable to fetch ${resourceDescription} for dataset.`,
    );
  });
});
