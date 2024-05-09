import {
  Recording,
  StepTestConfig,
  createMockStepExecutionContext,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
  STEP_NETWORK_INTELLIGENCE_CENTER,
  STEP_VPN_GATEWAY,
  STEP_VPN_GATEWAY_TUNNEL,
  VPN_GATEWAY_CLASS,
  VPN_GATEWAY_TUNNEL_CLASS,
  VPN_GATEWAY_TUNNEL_TYPE,
  VPN_GATEWAY_TYPE,
} from './constants';
import { integrationConfig } from '../../../test/config';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { IntegrationConfig, invocationConfig } from '../..';
import { fetchVpnGateway, fetchVpnGatewayTunnel } from '.';

const tempNewAccountConfig = {
  ...integrationConfig,
  serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
    'j1-gc-integration-dev-v2',
    'j1-gc-integration-dev-v3',
  ),
  serviceAccountKeyConfig: {
    ...integrationConfig.serviceAccountKeyConfig,
    project_id: 'j1-gc-integration-dev-v3',
  },
};

describe(`networkAnalyzer#${STEP_NETWORK_INTELLIGENCE_CENTER}`, () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_NETWORK_INTELLIGENCE_CENTER, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_NETWORK_INTELLIGENCE_CENTER,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_NETWORK_INTELLIGENCE_CENTER,
      instanceConfig: tempNewAccountConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`networkAnalyzer#${STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST}`, () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
      instanceConfig: tempNewAccountConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`networkAnalyzer#${STEP_VPN_GATEWAY}`, () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fechVpngateway',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchVpnGateway(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === VPN_GATEWAY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: VPN_GATEWAY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_vpn_gateway' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },

          name: { type: 'string' },
          projectId: { type: 'string' },
          summary: { type: 'string' },
          public: { type: 'boolean' },
          kind: { type: 'string' },
          category: { type: 'array' },
          function: { type: 'array' },
        },
      },
    });
  }, 50000);
});

describe(`networkAnalyzer#${STEP_VPN_GATEWAY_TUNNEL}`, () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchVpnTunnel',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchVpnGatewayTunnel(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === VPN_GATEWAY_TUNNEL_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: VPN_GATEWAY_TUNNEL_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_vpn_tunnel' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },

          name: { type: 'string' },
          projectId: { type: 'string' },
          summary: { type: 'string' },
          public: { type: 'boolean' },
          kind: { type: 'string' },
          category: { type: 'array' },
          function: { type: 'array' },
          vpnGatewayName: { type: 'string' },
        },
      },
    });
  }, 50000);
});
