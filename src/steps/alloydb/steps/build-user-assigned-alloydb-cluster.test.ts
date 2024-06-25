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
import { STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP } from '../constants';

describe(STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  test(STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const { collectedRelationships } = await executeStepWithDependencies(
      stepTestConfig,
    );

    expect(collectedRelationships.length).toBeGreaterThan(0);
  });
});
