import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../..';

import {
  STEP_BEYONDCORP_APP_CONNECTION,
  STEP_BEYONDCORP_APP_CONNECTOR,
  STEP_BEYONDCORP_APPLICATION_ENDPOINT,
  STEP_BEYONDCORP_ENTERPRISE,
  STEP_BEYONDCORP_GATEWAY,
} from './constant';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';

describe(`beyondcorp#${STEP_BEYONDCORP_APP_CONNECTOR}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_BEYONDCORP_APP_CONNECTOR,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_BEYONDCORP_APP_CONNECTOR,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_BEYONDCORP_APP_CONNECTOR,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`beyondcorp#${STEP_BEYONDCORP_GATEWAY}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_BEYONDCORP_GATEWAY,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_BEYONDCORP_GATEWAY,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_BEYONDCORP_GATEWAY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`beyondcorp#${STEP_BEYONDCORP_APP_CONNECTION}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_BEYONDCORP_APP_CONNECTION,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_BEYONDCORP_APP_CONNECTION,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_BEYONDCORP_APP_CONNECTION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`beyondcorp#${STEP_BEYONDCORP_APPLICATION_ENDPOINT}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_BEYONDCORP_APPLICATION_ENDPOINT,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_BEYONDCORP_APPLICATION_ENDPOINT,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_BEYONDCORP_APPLICATION_ENDPOINT,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});

describe(`beyondcorp#${STEP_BEYONDCORP_ENTERPRISE}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test(
    STEP_BEYONDCORP_ENTERPRISE,
    async () => {
      const stepTestConfig: StepTestConfig = {
        stepId: STEP_BEYONDCORP_ENTERPRISE,
        instanceConfig: integrationConfig,
        invocationConfig: invocationConfig as any,
      };

      recording = setupGoogleCloudRecording({
        name: STEP_BEYONDCORP_ENTERPRISE,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      });

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
    500_000,
  );
});
