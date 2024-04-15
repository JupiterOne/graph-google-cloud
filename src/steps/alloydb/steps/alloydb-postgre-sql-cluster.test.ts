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
import { STEP_ALLOYDB_POSTGRE_SQL_CLUSTER } from '../constants';

describe(STEP_ALLOYDB_POSTGRE_SQL_CLUSTER, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(STEP_ALLOYDB_POSTGRE_SQL_CLUSTER, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);

    const relStepTestConfig: StepTestConfig = {
      stepId: STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const relResult = await executeStepWithDependencies(relStepTestConfig);
    expect(relResult).toMatchStepMetadata(stepTestConfig);
  });
});
