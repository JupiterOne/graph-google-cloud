import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { FunctionStepsSpec } from './constants';
import { invocationConfig } from '../..';

describe('#functions', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  jest.setTimeout(45000);

  test(FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id, async () => {
    recording = setupGoogleCloudRecording({
      name: FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: FunctionStepsSpec.FETCH_CLOUD_FUNCTIONS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });

  test(
    FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.id,
    async () => {
      recording = setupGoogleCloudRecording({
        name: FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.id,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: FunctionStepsSpec.CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP.id,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );

  test(
    FunctionStepsSpec.CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIP.id,
    async () => {
      recording = setupGoogleCloudRecording({
        name: FunctionStepsSpec.CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIP.id,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId:
          FunctionStepsSpec.CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIP.id,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});
