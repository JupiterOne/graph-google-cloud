import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../../../../..';
import { integrationConfig } from '../../../../../../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../../../../../../test/recording';
import { STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP } from '../../../constants';

describe(`Cloud-Identity#${STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test.skip(
    STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
          recordFailedRequests: true,
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});
