import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../../../test/recording';
import {
  STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
  STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY
} from './constants';
import { invocationConfig } from '../..';

describe(STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(
    STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});

describe(STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(
    STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: STEP_GOOGLE_CLOUD_PROJECT_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});

describe(STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(
    STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: STEP_POLICY_INTELLIGENCE_ANALYZER_HAS_POLICY_INTELLIGENCE_ANALYZER_ACTIVITY,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});

