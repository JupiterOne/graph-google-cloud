import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchBigQueryDatasets } from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchResourceManagerProject } from '../resource-manager';

import { CLOUD_BIG_QUERY_DATASET_ENTITY_TYPE } from './constants';

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
    const customConfig = {
      ...integrationConfig,
      serviceAccountKeyConfig: {
        ...integrationConfig.serviceAccountKeyConfig,
        project_id: 'j1-gc-integration-dev-300716',
      },
    };
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: customConfig,
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
        (e) => e._type === CLOUD_BIG_QUERY_DATASET_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_big_query_dataset' },
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
