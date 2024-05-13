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
  import { STEP_COMPUTE_ENGINE_AUTOSCALERS } from '../constants';
  
  describe(`compute#${STEP_COMPUTE_ENGINE_AUTOSCALERS}`, () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });
  
    test(STEP_COMPUTE_ENGINE_AUTOSCALERS, async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_COMPUTE_ENGINE_AUTOSCALERS,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });
  
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_COMPUTE_ENGINE_AUTOSCALERS,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };
  
      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    });
  });
  