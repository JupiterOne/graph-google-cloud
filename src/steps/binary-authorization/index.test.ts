import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchBinaryAuthorizationPolicy } from '.';
import { fetchResourceManagerProject } from '../resource-manager/index';
import {
  BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
  RELATIONSHIP_TYPE_PROJECT_HAS_BINARY_AUTHORIZATION_POLICY,
} from './constants';
import { PROJECT_ENTITY_TYPE } from '../resource-manager/constants';

describe('#fetchBinaryAuthorization', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchBinaryAuthorization',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    await fetchResourceManagerProject(context);
    await fetchBinaryAuthorizationPolicy(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === PROJECT_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_project' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          parent: { type: 'string' },
          lifecycleState: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === BINARY_AUTHORIZATION_POLICY_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['AccessPolicy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_binary_authorization_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          admissionWhitelistPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          evaluationMode: { type: 'string' },
          globalPolicyEvaluationMode: { type: 'string' },
          webLink: { type: 'string' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_PROJECT_HAS_BINARY_AUTHORIZATION_POLICY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_cloud_project_has_binary_authorization_policy',
          },
        },
      },
    });
  });
});
