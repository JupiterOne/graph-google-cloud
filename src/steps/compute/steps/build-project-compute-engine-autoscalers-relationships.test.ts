import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../../..';
import { integrationConfig } from '../../../../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../../../../test/recording';
import { STEP_PROJECT_COMPUTE_ENGINE_AUTOSCALERS_RELATIONSHIPS } from '../constants';

describe(`compute#${STEP_PROJECT_COMPUTE_ENGINE_AUTOSCALERS_RELATIONSHIPS}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test.skip(
    STEP_PROJECT_COMPUTE_ENGINE_AUTOSCALERS_RELATIONSHIPS,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_PROJECT_COMPUTE_ENGINE_AUTOSCALERS_RELATIONSHIPS,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_PROJECT_COMPUTE_ENGINE_AUTOSCALERS_RELATIONSHIPS,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults.collectedRelationships.length).toBeGreaterThan(0);
    },
    500_000,
  );
});
