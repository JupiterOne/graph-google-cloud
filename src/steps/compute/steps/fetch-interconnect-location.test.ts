import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { STEP_INTERCONNECT_LOCATION } from '../constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../../test/recording';
import { integrationConfig } from '../../../../test/config';
import { invocationConfig } from '../../..';

describe(`compute#${STEP_INTERCONNECT_LOCATION}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_INTERCONNECT_LOCATION, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_INTERCONNECT_LOCATION,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_INTERCONNECT_LOCATION,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
