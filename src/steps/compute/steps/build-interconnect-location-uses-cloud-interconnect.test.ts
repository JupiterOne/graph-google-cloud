import {
  Recording,
  StepTestConfig,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { STEP_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT_RELATIONSHIP } from '../constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../../test/recording';
import { integrationConfig } from '../../../../test/config';
import { invocationConfig } from '../../..';

describe(`compute#${STEP_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT_RELATIONSHIP,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: STEP_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT_RELATIONSHIP,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});
