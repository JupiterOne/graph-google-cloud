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
import { SecretManagerSteps } from './constants';

describe('#secret-manager', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test('fetch-secrets', async () => {
    recording = setupGoogleCloudRecording({
      name: 'fetch-secrets',
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: SecretManagerSteps.FETCH_SECRETS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });

  test('fetch-secret-versions', async () => {
    recording = setupGoogleCloudRecording({
      name: 'fetch-secret-versions',
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: SecretManagerSteps.FETCH_SECRET_VERSIONS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
