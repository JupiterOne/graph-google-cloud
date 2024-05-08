import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  STEP_ARTIFACT_REGISTRY,
  STEP_ARTIFACT_REGISTRY_REPOSITORY,
  STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
} from './constants';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../..';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';

describe(`artifactRegistry#${STEP_ARTIFACT_REGISTRY_REPOSITORY}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_ARTIFACT_REGISTRY_REPOSITORY,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_ARTIFACT_REGISTRY_REPOSITORY,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_ARTIFACT_REGISTRY_REPOSITORY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`artifactRegistry#${STEP_ARTIFACT_REPOSIOTRY_PACKAGE}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`artifactRegistry#${STEP_ARTIFACT_REGISTRY}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_ARTIFACT_REGISTRY,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_ARTIFACT_REGISTRY,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_ARTIFACT_REGISTRY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});
