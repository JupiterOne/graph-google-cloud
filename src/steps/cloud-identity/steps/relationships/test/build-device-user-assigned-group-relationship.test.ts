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
import { STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP } from '../../../constants';

describe(`Cloud-Identity#${STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
