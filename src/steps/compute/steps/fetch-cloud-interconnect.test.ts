import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { STEP_CLOUD_INTERCONNECT } from '../constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../../test/recording';
import { integrationConfig } from '../../../../test/config';
import { invocationConfig } from '../../..';

describe(`compute#${STEP_CLOUD_INTERCONNECT}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_INTERCONNECT, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_INTERCONNECT,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_INTERCONNECT,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
