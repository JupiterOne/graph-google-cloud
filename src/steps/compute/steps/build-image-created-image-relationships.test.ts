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
import { STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS } from '../constants';

describe(`compute#${STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(999999);

  test.skip(
    STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
        directory: __dirname,
        options: {
          matchRequestsBy: {
            ...getMatchRequestsBy(integrationConfig),
            url: false,
          },
        },
      });

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults.collectedRelationships.length).toBeGreaterThan(0);
    },
    500_000,
  );
});
