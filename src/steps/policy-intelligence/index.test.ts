import {
  createMockStepExecutionContext,
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import {
  fetchPolicyAnalyzer,
} from '.';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording, getMatchRequestsBy } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  POLICY_INTELLIGENCE_ANALYZER_TYPE,
  STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
} from './constants';
import { invocationConfig } from '../..';

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

describe(`#${STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });
  test(STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });
    const stepTestConfig: StepTestConfig = {
      stepId: STEP_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };
    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  }, 300000);
});