import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchStorageBuckets } from '.';
import { integrationConfig } from '../../../test/config';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
} from './constants';

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

    expect(context.jobState.collectedRelationships.length).toEqual(0);
    expect(context.jobState.collectedEntities.length).toBeGreaterThanOrEqual(1);

    expect(context.jobState.collectedEntities).toEqual(
      context.jobState.collectedEntities.map((e) =>
        expect.objectContaining({
          ...e,
          _rawData: expect.any(Array),
          _class: [CLOUD_STORAGE_BUCKET_ENTITY_CLASS],
          _type: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
          _key: `bucket:${e.id}`,
          name: expect.any(String),
          displayName: e.name,
        }),
      ),
    );
  });
});
