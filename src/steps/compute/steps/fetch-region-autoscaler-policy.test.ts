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
import { STEP_AUTOSCALER_REGION_POLICY } from '../constants';

describe(`compute#${STEP_AUTOSCALER_REGION_POLICY}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_AUTOSCALER_REGION_POLICY,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_AUTOSCALER_REGION_POLICY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId: STEP_AUTOSCALER_REGION_POLICY,
        instanceConfig: {
          ...integrationConfig,
          serviceAccountKeyFile:
            integrationConfig.serviceAccountKeyFile.replace(
              'j1-gc-integration-dev-v2',
              'j1-gc-integration-dev-v3',
            ),
          serviceAccountKeyConfig: {
            ...integrationConfig.serviceAccountKeyConfig,
            project_id: 'j1-gc-integration-dev-v3',
          },
        },
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    100000,
  );
});
