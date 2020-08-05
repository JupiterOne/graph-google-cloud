import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchIamRoles } from '.';
import { integrationConfig } from '../../../test/config';

describe('#fetchIamRoles', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchIamRoles',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchIamRoles(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ['AccessRole'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_iam_role' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          description: { type: 'string' },
          stage: { type: 'string' },
          custom: { const: true },
          deleted: { type: 'boolean' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
          },
          etag: { type: 'string' },
        },
      },
    });
  });
});
