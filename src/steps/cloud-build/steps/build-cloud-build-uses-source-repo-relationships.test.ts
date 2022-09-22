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

describe(`cloud-build#${CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(
    CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS
      .id,
    async () => {
      recording = setupGoogleCloudRecording({
        name: CloudBuildStepsSpec
          .BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS.id,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId:
          CloudBuildStepsSpec
            .BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS.id,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});
