import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../..';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import {
  STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
  STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
  STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
  STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
  STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
  STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
  STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
} from './constants';

describe(`Cloud-Sql#${STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`Cloud-Sql#${STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
        recordFailedRequests: true,
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});
