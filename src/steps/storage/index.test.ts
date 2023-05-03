import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { StorageStepsSpec } from '../storage/constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../..';

describe(`storage#${StorageStepsSpec.FETCH_STORAGE_BUCKETS.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(StorageStepsSpec.FETCH_STORAGE_BUCKETS.id, async () => {
    recording = setupGoogleCloudRecording({
      name: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
