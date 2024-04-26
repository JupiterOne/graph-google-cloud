import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP,
  STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP,
} from './constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../..';

describe(`memoryStoreRedis#${STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`memoryStoreRedis#${STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
