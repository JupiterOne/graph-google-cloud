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
import { PrivatecaSteps } from '../constants';

describe(`privateca#${PrivatecaSteps.STEP_CREATE_PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY_RELATIONSHIPS.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(
    PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY_RELATIONSHIPS.id,
    async () => {
      recording = setupGoogleCloudRecording({
        name: PrivatecaSteps
          .STEP_CREATE_PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY_RELATIONSHIPS.id,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId:
          PrivatecaSteps
            .STEP_CREATE_PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY_RELATIONSHIPS.id,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});
