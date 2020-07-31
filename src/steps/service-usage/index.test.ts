import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchApiServices } from '.';
import { integrationConfig } from '../../../test/config';
import { toMatchGraphObjectSchema } from '../../../test/jest';

expect.extend({ toMatchGraphObjectSchema });

describe('#fetchApiServices', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchApiServices',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchApiServices(context);

    expect({
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      additionalProperties: false,
      properties: {
        _class: { const: ['Service'] },
        _type: { const: 'google_cloud_api_service' },
        category: { const: ['infrastructure'] },
        state: {
          type: 'string',
          enum: ['STATE_UNSPECIFIED', 'DISABLED', 'ENABLED'],
        },
        enabled: { type: 'boolean' },
        usageRequirements: {
          type: 'array',
          items: { type: 'string' },
        },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    });
  });
});
