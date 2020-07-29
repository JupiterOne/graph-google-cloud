import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchCloudFunctions } from '.';
import { integrationConfig } from '../../../test/config';
import {
  CLOUD_FUNCTION_ENTITY_CLASS,
  CLOUD_FUNCTION_ENTITY_TYPE,
} from './constants';
import { generateEntityKey } from '../../utils/generateKeys';

describe('#fetchCloudFunctions', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCloudFunctions',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchCloudFunctions(context);

    expect(context.jobState.collectedRelationships.length).toEqual(0);
    expect(context.jobState.collectedEntities.length).toBeGreaterThanOrEqual(1);

    expect(context.jobState.collectedEntities).toEqual(
      context.jobState.collectedEntities.map((e) =>
        expect.objectContaining({
          ...e,
          _rawData: expect.any(Array),
          _class: [CLOUD_FUNCTION_ENTITY_CLASS],
          _type: CLOUD_FUNCTION_ENTITY_TYPE,
          _key: generateEntityKey({
            type: CLOUD_FUNCTION_ENTITY_TYPE,
            id: e.name as string,
          }),
          name: expect.any(String),
          displayName: e.name,
          runtime: expect.any(String),
          updatedOn: expect.any(Number),
          availableMemoryMb: expect.any(Number),
          timeout: expect.any(String),
          version: expect.any(String),
          handler: expect.any(String),
          status: expect.any(String),
        }),
      ),
    );
  });
});
