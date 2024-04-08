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
import { STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP } from '../constant';

describe(STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test.skip(STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_CLOUD_DEPLOY_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
