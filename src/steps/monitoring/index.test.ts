import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { STEP_MONITORING_ALERT_POLICIES } from './constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../../index';

describe(STEP_MONITORING_ALERT_POLICIES, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(STEP_MONITORING_ALERT_POLICIES, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_MONITORING_ALERT_POLICIES,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_MONITORING_ALERT_POLICIES,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
