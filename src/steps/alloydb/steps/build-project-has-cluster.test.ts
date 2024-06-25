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
import { STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP } from '../constants';

describe(STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(450000);

  const integrationConfigNew = {
    ...integrationConfig,
    serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
      'j1-gc-integration-dev-v2',
      'j1-gc-integration-dev-v3',
    ),
    serviceAccountKeyConfig: {
      ...integrationConfig.serviceAccountKeyConfig,
      project_id: 'j1-gc-integration-dev-v3',
    },
  }

  test(STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfigNew),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_ALLOYDB_CLUSTER_RELATIONSHIP,
      instanceConfig: integrationConfigNew,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
