import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  fetchPolicyAnalyzer,
  fetchPolicyAnalyzerActivity
} from '.';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  POLICY_INTELLIGENCE_ANALYZER_TYPE,
  POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
} from './constants';

const tempNewAccountConfig = {
  ...integrationConfig,
  serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
    'j1-gc-integration-dev-v2',
    'j1-gc-integration-dev-v3',
  ),
  serviceAccountKeyConfig: {
    ...integrationConfig.serviceAccountKeyConfig,
    project_id: 'j1-gc-integration-dev-v3',
  },
};

describe('#fetchPolicyAnalyzer', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchPolicyAnalyzer',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchPolicyAnalyzer(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.type === POLICY_INTELLIGENCE_ANALYZER_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_policy_intelligence_analyzer' },
          name: { type: 'string' },
          category: { type: 'array' },
          function: { type: 'array' },
        },
      },
    });
  });
});

describe('#fetchPolicyAnalyzerActivity', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchPolicyAnalyzerActivity',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchPolicyAnalyzerActivity(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.type === POLICY_INTELLIGENCE_ANALYZER_ACTIVITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Assessment'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_policy_intelligence_analyzer_activity' },
          name: { type: 'string' },
          summary: { type: 'string' },
          category: { type: 'string' },
          serviceAccountId: { type: 'string' },
          internal: { type: 'boolean' }
        },
      },
    });
  });
});