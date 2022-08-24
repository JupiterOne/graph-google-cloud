import {
  executeStepWithDependencies,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import {
  getMatchRequestsBy,
  Recording,
  setupGoogleCloudRecording,
} from '../../../test/recording';
import { CloudBuildSteps } from './constants';

describe('#cloud-build', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test('fetch-cloud-builds', async () => {
    recording = setupGoogleCloudRecording({
      name: 'fetch-cloud-builds',
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: CloudBuildSteps.FETCH_BUILDS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
