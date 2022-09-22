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

describe(`cloud-build#${CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(
    CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS
      .id,
    async () => {
      recording = setupGoogleCloudRecording({
        name: CloudBuildStepsSpec
          .BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId:
          CloudBuildStepsSpec
            .BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const { collectedRelationships } = await executeStepWithDependencies(
        stepTestConfig,
      );

      expect(collectedRelationships.length).toBe(1);
      expect(collectedRelationships).toTargetEntities([
        {
          _class: ['CodeRepo'],
          _type: 'github_repo',
          _key: 'MDEwOlJlcG9zaXRvcnky',
          webLink: 'https://ghe.fosfori.to/tomy/gato',
          name: 'gato',
          displayName: 'gato',
          fullName: 'tomy/gato',
          owner: 'tomy',
        },
      ]);
    },
  );
});
