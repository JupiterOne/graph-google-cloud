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
import { STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE } from '../constant';

describe(STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);

    const relStepTestConfig = {
      stepId: STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const relResult = await executeStepWithDependencies(relStepTestConfig);
    expect(relResult).toMatchStepMetadata(stepTestConfig);
  });
});