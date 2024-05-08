import {
  StepTestConfig,
  createMockStepExecutionContext,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import {
  Recording,
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchAlertPolicies } from '.';
import {
  MONITORING_ALERT_POLICY_TYPE,
  STEP_CLOUD_MONITORING,
  STEP_MONITORING_CHANNELS,
  STEP_MONITORING_GROUPS,
} from './constants';
import { invocationConfig } from '../..';

describe('#fetchAlertPolicies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAlertPolicies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      //instanceConfig: integrationConfig,
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

    await fetchAlertPolicies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === MONITORING_ALERT_POLICY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Policy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_monitoring_alert_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          content: { type: 'string' },
          conditionFilters: {
            type: 'array',
            items: { type: 'string' },
          },
          enabled: { type: 'boolean' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });
  });
});

describe(`cloudMonitoring#${STEP_MONITORING_CHANNELS}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_MONITORING_CHANNELS,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_MONITORING_CHANNELS,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_MONITORING_CHANNELS,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`cloudMonitoring#${STEP_MONITORING_GROUPS}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_MONITORING_GROUPS,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_MONITORING_GROUPS,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_MONITORING_GROUPS,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`cloudMonitoring#${STEP_CLOUD_MONITORING}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_CLOUD_MONITORING,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_CLOUD_MONITORING,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_CLOUD_MONITORING,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});
