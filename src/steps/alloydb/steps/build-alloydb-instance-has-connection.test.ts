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
import { STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP } from '../constants';

describe(STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
