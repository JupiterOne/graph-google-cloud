import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchBigQueryDatasets } from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchResourceManagerProject } from '../resource-manager';

import { BIG_QUERY_DATASET_ENTITY_TYPE } from './constants';

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

    await fetchResourceManagerProject(context);
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
      _class: ['DataStore'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigquery_dataset' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          public: { type: 'boolean' },
          location: { type: 'string' },
          webLink: { type: 'string' },
          encrypted: { type: 'boolean' },
          classification: { const: null },
          etag: { type: 'string' },
        },
      },
    });
  });
});
