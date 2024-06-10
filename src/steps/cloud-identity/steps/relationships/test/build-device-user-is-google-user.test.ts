import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../../../../..';
import { integrationConfig } from '../../../../../../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../../../../../../test/recording';
import { STEP_DEVICE_USER_IS_GOOGLE_USER } from '../../../constants';

describe(STEP_DEVICE_USER_IS_GOOGLE_USER, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test.skip(STEP_DEVICE_USER_IS_GOOGLE_USER, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_DEVICE_USER_IS_GOOGLE_USER,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_DEVICE_USER_IS_GOOGLE_USER,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const { collectedRelationships } = await executeStepWithDependencies(
      stepTestConfig,
    );

    expect(collectedRelationships.length).toBeGreaterThan(0);
  });
});
