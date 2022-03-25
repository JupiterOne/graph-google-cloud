import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { pickBy } from 'lodash';
import { getMockLogger } from '../../../test/helpers/getMockLogger';
import {
  testResourceIdentifiers,
  TEST_PROJECT_ID,
  TEST_PROJECT_NAME,
} from './findResourceKindFromCloudResourceIdentifier.test';
import { integrationConfig } from '../../../test/config';
import {
  getTypeAndKeyFromResourceIdentifier,
  makeLogsForTypeAndKeyResponse,
  TypeAndKey,
} from './getTypeAndKeyFromResourceIdentifier';
import { J1_TYPES_WITHOUT_A_UNIQUE_KIND, NONE } from './resourceKindToTypeMap';
import {
  impossible,
  J1_TYPE_TO_KEY_GENERATOR_MAP,
} from './typeToKeyGeneratorMap';
import {
  BIG_QUERY_DATASET_ENTITY_TYPE,
  BIG_QUERY_TABLE_ENTITY_TYPE,
} from '../../steps/big-query';

const jupiterOneTypesWithMappedGoogleResources = Object.keys(
  pickBy(J1_TYPE_TO_KEY_GENERATOR_MAP, (keyMethod) => keyMethod !== impossible),
).filter((type) => !J1_TYPES_WITHOUT_A_UNIQUE_KIND.includes(type));

describe('getTypeAndKeyFromResourceIdentifier', () => {
  it.skip(`should find the correct keys for all available resources`, async () => {
    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
      setData: {
        // Used when maping google_projects
        [`projectId:${TEST_PROJECT_ID}`]: TEST_PROJECT_NAME,
      },
    });
    const successfullyMappedTypes: string[] = [];
    for (const identifier of Object.keys(testResourceIdentifiers)) {
      const { type, key } =
        (await getTypeAndKeyFromResourceIdentifier(identifier, context)) ?? {};
      expect({ identifier, type, key }).toMatchSnapshot();
      if (type && jupiterOneTypesWithMappedGoogleResources.includes(type)) {
        successfullyMappedTypes.push(type);
      }
    }

    expect(successfullyMappedTypes.sort()).toEqual(
      expect.arrayContaining(jupiterOneTypesWithMappedGoogleResources.sort()),
    );
  });

  test('`google_bigquery_table`s should have their `_key` generated properly', async () => {
    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    const exampleBigQueryTableResourceIdentifier = `//bigquery.googleapis.com/projects/${TEST_PROJECT_ID}/datasets/test_big_query_dataset/tables/Test Table`;
    const expectedKey = `${TEST_PROJECT_ID}:test_big_query_dataset.Test Table`;
    const { key, type } = await getTypeAndKeyFromResourceIdentifier(
      exampleBigQueryTableResourceIdentifier,
      context,
    );
    expect(key).toBe(expectedKey);
    expect(type).toBe(BIG_QUERY_TABLE_ENTITY_TYPE);
  });

  test('`google_bigquery_dataset`s should have their `_key` generated properly', async () => {
    const context = createMockStepExecutionContext({
      instanceConfig: integrationConfig,
    });
    const exampleBigQueryDatasetResourceIdentifier = `//bigquery.googleapis.com/projects/${TEST_PROJECT_ID}/datasets/test_big_query_dataset`;
    const expectedKey = `${TEST_PROJECT_ID}:test_big_query_dataset`;
    const { key, type } = await getTypeAndKeyFromResourceIdentifier(
      exampleBigQueryDatasetResourceIdentifier,
      context,
    );
    expect(key).toBe(expectedKey);
    expect(type).toBe(BIG_QUERY_DATASET_ENTITY_TYPE);
  });
});

describe('makeLogsForTypeAndKeyResponse', () => {
  it(`should log 'Unable to find google cloud resource identifier.' when there is no googleResourceKind`, () => {
    const typeAndKeyResponse: TypeAndKey = { metadata: {} };
    const logger = getMockLogger<IntegrationLogger>();
    makeLogsForTypeAndKeyResponse(logger, typeAndKeyResponse);
    expect(logger.warn).toHaveBeenCalledWith(
      typeAndKeyResponse,
      'Unable to find google cloud resource identifier.',
    );
  });
  it(`should log 'Unable to find J1 type from google cloud resource.' when there is no type`, () => {
    const typeAndKeyResponse: TypeAndKey = {
      metadata: { googleResourceKind: 'googleResourceKind' },
    };
    const logger = getMockLogger<IntegrationLogger>();
    makeLogsForTypeAndKeyResponse(logger, typeAndKeyResponse);
    expect(logger.info).toHaveBeenCalledWith(
      typeAndKeyResponse,
      'Unable to find J1 type from google cloud resource.',
    );
  });
  it(`should log 'There is no JupiterOne entity for this resource.' when the type is mapped to NONE`, () => {
    const typeAndKeyResponse: TypeAndKey = {
      type: NONE,
      metadata: { googleResourceKind: 'googleResourceKind' },
    };
    const logger = getMockLogger<IntegrationLogger>();
    makeLogsForTypeAndKeyResponse(logger, typeAndKeyResponse);
    expect(logger.info).toHaveBeenCalledWith(
      typeAndKeyResponse,
      'There is no JupiterOne entity for this resource.',
    );
  });
  it(`should log 'Unable to find a key generation function for this entity.' when a function is not found`, () => {
    const typeAndKeyResponse: TypeAndKey = {
      type: 'type',
      metadata: { googleResourceKind: 'googleResourceKind' },
    };
    const logger = getMockLogger<IntegrationLogger>();
    makeLogsForTypeAndKeyResponse(logger, typeAndKeyResponse);
    expect(logger.warn).toHaveBeenCalledWith(
      typeAndKeyResponse,
      'Unable to find a key generation function for this entity.',
    );
  });
  it(`should log 'Unable to generate key for this type.' when the key generation function does not product a key`, () => {
    const typeAndKeyResponse: TypeAndKey = {
      type: 'type',
      metadata: {
        googleResourceKind: 'googleResourceKind',
        keyGenFunction: () => null,
      },
    };
    const logger = getMockLogger<IntegrationLogger>();
    makeLogsForTypeAndKeyResponse(logger, typeAndKeyResponse);
    expect(logger.warn).toHaveBeenCalledWith(
      typeAndKeyResponse,
      'Unable to generate key for this type.',
    );
  });
  it(`should not log anything and return the response on correct responses`, () => {
    const typeAndKeyResponse: TypeAndKey = {
      type: 'type',
      key: 'key',
      metadata: {
        googleResourceKind: 'googleResourceKind',
        keyGenFunction: () => null,
      },
    };
    const logger = getMockLogger<IntegrationLogger>();
    expect(makeLogsForTypeAndKeyResponse(logger, typeAndKeyResponse)).toBe(
      typeAndKeyResponse,
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
