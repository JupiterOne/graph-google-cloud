import {
  Recording,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchIamRoles, fetchIamServiceAccounts } from '.';
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
          _type: { const: 'google_iam_role' },
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

describe('#fetchIamServiceAccounts', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchIamServiceAccounts',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchIamServiceAccounts(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === 'google_iam_service_account',
      ),
    ).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_iam_service_account' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          enabled: { type: 'boolean' },
          projectId: { type: 'string' },
          id: { type: 'string' },
          oauth2ClientId: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === 'google_iam_service_account_key',
      ),
    ).toMatchGraphObjectSchema({
      _class: ['AccessKey'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_iam_service_account_key' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          origin: { type: 'string' },
          type: { type: 'string' },
          algorithm: { type: 'string' },
        },
      },
    });

    expect(context.jobState.collectedRelationships).toEqual(
      context.jobState.collectedRelationships.map((r) =>
        expect.objectContaining({
          _class: 'HAS',
          webLink: expect.any(String),
        }),
      ),
    );
  });
});
