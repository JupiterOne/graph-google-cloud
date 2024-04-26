import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  STEP_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INSTANCE_RELATIONSHIP,
  STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP,
  STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP,
  STEP_PROJECT_HAS_REDIS_INSTANCE_RELATIONSHIP,
} from './constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../..';

const tempNewAccountConfig = {
  ...integrationConfig,
  serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
    'j1-gc-integration-dev-v2',
    'j1-gc-integration-dev-v3',
  ),
  serviceAccountKeyConfig: {
    ...integrationConfig.serviceAccountKeyConfig,
    project_id: 'j1-gc-integration-dev-v3',
  },
};

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
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_RELATIONSHIP,
      instanceConfig: tempNewAccountConfig,
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
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_MEMORYSTORE_REDIS_LOCATION_RELTIONSHIP,
      instanceConfig: tempNewAccountConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`memoryStoreRedis#${STEP_PROJECT_HAS_REDIS_INSTANCE_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_PROJECT_HAS_REDIS_INSTANCE_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_PROJECT_HAS_REDIS_INSTANCE_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_REDIS_INSTANCE_RELATIONSHIP,
      instanceConfig: tempNewAccountConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`memoryStoreRedis#${STEP_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INSTANCE_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(
    STEP_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INSTANCE_RELATIONSHIP,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INSTANCE_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: STEP_MEMORYSTORE_REDIS_LOCATION_HAS_REDIS_INSTANCE_RELATIONSHIP,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});
