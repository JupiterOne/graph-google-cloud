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
import { STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP } from '../constant';

describe(
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP,
  () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });

    jest.setTimeout(450000);

    test(
      STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP,
      async () => {
        recording = setupGoogleCloudRecording({
          name: STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });

        const stepTestConfig: StepTestConfig = {
          stepId:
            STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE_USES_GITHUB_REPO_RELAIONSHIP,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };

        const { collectedRelationships } = await executeStepWithDependencies(
          stepTestConfig,
        );

        expect(collectedRelationships.length).toBeGreaterThan(0);
      },
    );
  },
);
