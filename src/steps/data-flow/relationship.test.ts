import {
    executeStepWithDependencies,
    Recording,
    StepTestConfig,
  } from '@jupiterone/integration-sdk-testing';
  import { invocationConfig } from '../..';
  import { integrationConfig } from '../../../test/config';
  import {
    getMatchRequestsBy,
    setupGoogleCloudRecording,
  } from '../../../test/recording';
import { STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    STEP_GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
    STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
    STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
    STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
    STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
 } from './constants';
  
  describe(STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE, () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });
  
    jest.setTimeout(450000);
  
    test(
        STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
      async () => {
        recording = setupGoogleCloudRecording({
          name: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });
  
        const stepTestConfig: StepTestConfig = {
          stepId: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };
  
        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
      },
    );
  });

  describe(STEP_GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT, () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });
  
    jest.setTimeout(450000);
  
    test(
        STEP_GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
      async () => {
        recording = setupGoogleCloudRecording({
          name: STEP_GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });
  
        const stepTestConfig: StepTestConfig = {
          stepId: STEP_GOOGLE_CLOUD_DATAFLOW_JOB_HAS_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };
  
        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
      },
    );
  });

  describe(STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE, () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });
  
    jest.setTimeout(450000);
  
    test(
        STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
      async () => {
        recording = setupGoogleCloudRecording({
          name: STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });
  
        const stepTestConfig: StepTestConfig = {
          stepId: STEP_GOOGLE_CLOUD_DATAFLOW_JOB_USES_GOOGLE_CLOUD_DATAFLOW_DATASTORE,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };
  
        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
      },
    );
  });

  describe(STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE, () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });
  
    jest.setTimeout(450000);
  
    test(
        STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
      async () => {
        recording = setupGoogleCloudRecording({
          name: STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });
  
        const stepTestConfig: StepTestConfig = {
          stepId: STEP_GOOGLE_CLOUD_DATAFLOW_SNAPSHOT_USES_GOOGLE_PUBSUB_TOPIC,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };
  
        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
      },
    );
  });

  describe(STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_DATASTORE, () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });
  
    jest.setTimeout(450000);
  
    test(
        STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
      async () => {
        recording = setupGoogleCloudRecording({
          name: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });
  
        const stepTestConfig: StepTestConfig = {
          stepId: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };
  
        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
      },
    );
  });

  describe(STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB, () => {
    let recording: Recording;
    afterEach(async () => {
      if (recording) await recording.stop();
    });
  
    jest.setTimeout(450000);
  
    test(
        STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
      async () => {
        recording = setupGoogleCloudRecording({
          name: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
          directory: __dirname,
          options: {
            matchRequestsBy: getMatchRequestsBy(integrationConfig),
          },
        });
  
        const stepTestConfig: StepTestConfig = {
          stepId: STEP_GOOGLE_CLOUD_PROJECT_HAS_GOOGLE_CLOUD_DATAFLOW_JOB,
          instanceConfig: integrationConfig,
          invocationConfig: invocationConfig as any,
        };
  
        const result = await executeStepWithDependencies(stepTestConfig);
        expect(result).toMatchStepMetadata(stepTestConfig);
      },
    );
  });
  