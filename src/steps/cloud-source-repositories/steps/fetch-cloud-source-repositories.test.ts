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
import { CloudSourceRepositoriesStepsSpec } from '../constants';

describe(`cloud-build#${CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id, async () => {
    recording = setupGoogleCloudRecording({
      name: CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
