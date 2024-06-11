import {
  createMockStepExecutionContext,
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig, invocationConfig } from '../..';

import {
  BEYONDCORP_APP_CONNECTION_TYPE,
  BEYONDCORP_APP_CONNECTOR_TYPE,
  BEYONDCORP_GATEWAY_TYPE,
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
import { fetchAppConnections, fetchAppConnectors, fetchGateways } from '.';


describe(`beyondcorp#${STEP_BEYONDCORP_APP_CONNECTOR}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_BEYONDCORP_APP_CONNECTOR,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });

  test(STEP_BEYONDCORP_APP_CONNECTOR, async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchAppConnectors(context);

    const app_connector = context.jobState.collectedEntities.filter(
      (e) => e._type === BEYONDCORP_APP_CONNECTOR_TYPE,
    );
    expect(app_connector.length).toBeGreaterThan(0);
  });
});

describe(`beyondcorp#${STEP_BEYONDCORP_GATEWAY}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_BEYONDCORP_GATEWAY,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });

  test(STEP_BEYONDCORP_GATEWAY, async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchGateways(context);

    const gateway = context.jobState.collectedEntities.filter(
      (e) => e._type === BEYONDCORP_GATEWAY_TYPE,
    );
    expect(gateway.length).toBeGreaterThan(0);
  });
});

describe(`beyondcorp#${STEP_BEYONDCORP_APP_CONNECTION}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_BEYONDCORP_APP_CONNECTION,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });

  test(STEP_BEYONDCORP_APP_CONNECTION, async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });
    await fetchAppConnections(context);

    const app_connection = context.jobState.collectedEntities.filter(
      (e) => e._type === BEYONDCORP_APP_CONNECTION_TYPE,
    );
    expect(app_connection.length).toBeGreaterThan(0);
  });
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
