import {
  Recording,
  createMockStepExecutionContext,
  MockIntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchResourceManagerIamPolicy, fetchResourceManagerProject } from '.';
import { integrationConfig } from '../../../test/config';
import { iamSteps, IAM_USER_ENTITY_TYPE, IAM_ROLE_ENTITY_TYPE } from '../iam';
import { ResourceManagerClient } from './client';

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
    if (recording) {
      await recording.stop();
    }
  });

  test('should only create one user entity when returned multiple times from API', async () => {
    jest
      .spyOn(ResourceManagerClient.prototype, 'getServiceAccountPolicy')
      .mockResolvedValueOnce({
        bindings: [
          {
            role: 'roles/editor',
            members: ['user:austin.kelleher@jupiterone.io'],
          },
          {
            role: 'roles/owner',
            members: ['user:austin.kelleher@jupiterone.io'],
          },
        ],
      });

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchResourceManagerIamPolicy(context);
    const iamUserEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === IAM_USER_ENTITY_TYPE,
    );
    expect(iamUserEntities.length).toBe(1);
    expect(iamUserEntities[0]._key).toBe('austin.kelleher@jupiterone.io');

    const iamRoleEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === IAM_ROLE_ENTITY_TYPE,
    );
    expect(iamRoleEntities.length).toBe(2);
    expect(iamRoleEntities.map((e) => e._key)).toMatchObject([
      'roles/editor',
      'roles/owner',
    ]);
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
      (e) => e._type === 'google_iam_service_account',
    );
    const iamServiceAccountKeyEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === 'google_iam_service_account_key',
    );
    const iamServiceAccountAssignedRoleRelationships = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'google_iam_service_account_assigned_role',
    );
    const iamServiceAccountHasKeyRelationships = context.jobState.collectedRelationships.filter(
      (r) => r._type === 'google_iam_service_account_has_key',
    );

    expect(userEntities.length).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountEntities.length).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountKeyEntities.length).toBeGreaterThanOrEqual(1);
    expect(
      iamServiceAccountAssignedRoleRelationships.length,
    ).toBeGreaterThanOrEqual(1);
    expect(iamServiceAccountHasKeyRelationships.length).toBeGreaterThanOrEqual(
      1,
    );

    expect(userEntities).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_user' },
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

    expect(iamServiceAccountKeyEntities).toMatchGraphObjectSchema({
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

    expect(iamServiceAccountAssignedRoleRelationships).toEqual(
      iamServiceAccountAssignedRoleRelationships.map((r) =>
        expect.objectContaining({
          _class: 'ASSIGNED',
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

describe('#fetchResourceManagerProject', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchResourceManagerProject',
      options: { recordFailedRequests: true },
    });
  });

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchResourceManagerProject(context);
    console.log(context.jobState.collectedEntities);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_project' },
          name: { type: 'string' },
          projectNumber: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          'parent.id': { type: 'string' },
          'parent.type': { type: 'string' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    });
  });
});
