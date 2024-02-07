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
import { STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS } from '../constants';

describe(`compute#${STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
        directory: __dirname,
        options: {
          matchRequestsBy: {
            ...getMatchRequestsBy(integrationConfig),
            url: false,
          },
          recordFailedRequests: true,
        },
      });

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults.collectedRelationships.length).toBeGreaterThan(0);
    },
    500_000,
  );
});
