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
import { CloudBuildStepsSpec } from '../constants';

describe(`cloud-build#${CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id, async () => {
    recording = setupGoogleCloudRecording({
      name: CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
