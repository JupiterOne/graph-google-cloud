import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP } from '../constants';
import { invocationConfig } from '../../..';
import { integrationConfig } from '../../../../test/config';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../../test/recording';

describe(`compute#${STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepResults = await executeStepWithDependencies(stepTestConfig);
      expect(stepResults.collectedRelationships.length).toBeGreaterThan(0);
    },
    500_000,
  );
});
