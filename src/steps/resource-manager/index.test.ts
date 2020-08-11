import {
  Recording,
  createMockStepExecutionContext,
  MockIntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchResourceManagerIamPolicy } from '.';
import { integrationConfig } from '../../../test/config';
import { iamSteps, IAM_USER_ENTITY_TYPE } from '../iam';

async function executeIamSteps(
  context: MockIntegrationStepExecutionContext<IntegrationConfig>,
) {
  for (const step of iamSteps) {
    await step.executionHandler(context);
  }
}

describe('#fetchResourceManagerIamPolicy', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchResourceManagerIamPolicy',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await executeIamSteps(context);
    await fetchResourceManagerIamPolicy(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    const userEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === IAM_USER_ENTITY_TYPE,
    );
    const iamServiceAccountEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === 'google_cloud_iam_service_account',
    );
    const iamServiceAccountKeyEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === 'google_cloud_iam_service_account_key',
    );
    const iamServiceAccountImplementsRoleRelationships = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'google_cloud_iam_service_account_implements_role',
    );
    const iamServiceAccountHasKeyRelationships = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'google_cloud_iam_service_account_has_key',
    );

    expect(userEntities.length).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountEntities.length).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountKeyEntities.length).toBeGreaterThanOrEqual(1);
    expect(
      iamServiceAccountImplementsRoleRelationships.length,
    ).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountHasKeyRelationships.length).toBeGreaterThanOrEqual(
      1,
    );

    expect(userEntities).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_iam_user' },
          type: { type: 'string' },
          deleted: { type: 'boolean' },
          uniqueid: { type: 'string' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    });

    expect(iamServiceAccountEntities).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_iam_service_account' },
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

    expect(iamServiceAccountKeyEntities).toMatchGraphObjectSchema({
      _class: ['AccessKey'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_iam_service_account_key' },
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

    expect(iamServiceAccountImplementsRoleRelationships).toEqual(
      iamServiceAccountImplementsRoleRelationships.map((r) =>
        expect.objectContaining({
          _class: 'IMPLEMENTS',
        }),
      ),
    );

    expect(iamServiceAccountHasKeyRelationships).toEqual(
      iamServiceAccountHasKeyRelationships.map((r) =>
        expect.objectContaining({
          _class: 'HAS',
        }),
      ),
    );
  });
});
