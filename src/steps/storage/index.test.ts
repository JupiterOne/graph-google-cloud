import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchStorageBuckets } from '.';
import { integrationConfig } from '../../../test/config';

describe('#fetchCloudStorageBuckets', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCloudStorageBuckets',
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

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
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
          uniformBucketLevelAccess: { type: 'boolean' },
          public: { type: 'boolean' },
          classification: { const: null },
          etag: { type: 'string' },
        },
      },
    });
  });
});
