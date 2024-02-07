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
import { STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES } from '../constants';

describe(`compute#${STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test.skip(STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
