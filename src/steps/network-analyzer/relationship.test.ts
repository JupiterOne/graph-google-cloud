import {
  Recording,
  StepTestConfig,
  createMockStepExecutionContext,
  executeStepWithDependencies,
  filterGraphObjects,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import {
  NETWORK_ANALYZER_CONNECTIVITY_TEST_CLASS,
  NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
  NETWORK_INTELLIGENCE_CENTER_CLASS,
  NETWORK_INTELLIGENCE_CENTER_TYPE,
  RELATIONSHIP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
  RELATIONSHIP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP_TYPE,
  STEP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
  STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
  STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP,
  STEP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP,
  VPN_GATEWAY_CLASS,
  VPN_GATEWAY_TUNNEL_CLASS,
  VPN_GATEWAY_TUNNEL_TYPE,
  VPN_GATEWAY_TYPE,
} from './constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { IntegrationConfig, invocationConfig } from '../..';
import {
  ExplicitRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import {
  buildNetworkIntelligenceCenterHasNetworkAnalyzerConnectivityTestRelationship,
  buildVpnGatewayVpnGatewayTunnelRelationship,
  fetchNetworkAnalyzerConnectivityTest,
  fetchNetworkIntelligenceCenter,
  fetchVpnGateway,
  fetchVpnGatewayTunnel,
} from '.';

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

describe(`networkAnalyzer#${STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  jest.setTimeout(45000);

  test(STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP, async () => {
    recording = setupGoogleCloudRecording({
      name: STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP,
      instanceConfig: tempNewAccountConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });
});

describe(`networkAnalyzer#${STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP}`, () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  jest.setTimeout(45000);

  test(
    STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
    async () => {
      recording = setupGoogleCloudRecording({
        name: STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy(tempNewAccountConfig),
        },
      });

      const stepTestConfig: StepTestConfig = {
        stepId:
          STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
        instanceConfig: tempNewAccountConfig,
        invocationConfig: invocationConfig as any,
      };

      const result = await executeStepWithDependencies(stepTestConfig);
      expect(result).toMatchStepMetadata(stepTestConfig);
    },
  );
});

describe(`networkAnalyzer#${STEP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });
    await fetchNetworkAnalyzerConnectivityTest(context);
    await fetchNetworkIntelligenceCenter(context);
    await buildNetworkIntelligenceCenterHasNetworkAnalyzerConnectivityTestRelationship(
      context,
    );
    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === NETWORK_INTELLIGENCE_CENTER_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: NETWORK_INTELLIGENCE_CENTER_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_network_analyzer' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          name: { type: 'string' },
          locationId: { type: 'string' },
          category: { type: 'array' },
          function: { type: 'array' },
        },
      },
    });
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: NETWORK_ANALYZER_CONNECTIVITY_TEST_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_network_analyzer_connectivity_test' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          projectId: { type: 'string' },
          displayName: { type: 'string' },
          category: { type: 'string' },
          summary: { type: 'string' },
          internal: { type: 'boolean' },
        },
      },
    });
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const:
              RELATIONSHIP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          },
        },
      },
    });
  });
});

describe(`networkAnalyzer#${STEP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP}`, () => {
  let recording: Recording;
  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: STEP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP,
    });
  });
  afterEach(async () => {
    await recording.stop();
  });
  function separateRelationships(collectedRelationships: Relationship[]) {
    const { targets: directRelationships } = filterGraphObjects(
      collectedRelationships,
      (r) => !r._mapping,
    ) as {
      targets: ExplicitRelationship[];
    };
    return {
      directRelationships,
    };
  }
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });
    await fetchVpnGateway(context);
    await fetchVpnGatewayTunnel(context);
    await buildVpnGatewayVpnGatewayTunnelRelationship(context);
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
          _type: { const: VPN_GATEWAY_TYPE },
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
    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === VPN_GATEWAY_TUNNEL_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: VPN_GATEWAY_TUNNEL_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: VPN_GATEWAY_TUNNEL_TYPE },
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
    const { directRelationships } = separateRelationships(
      context.jobState.collectedRelationships,
    );
    expect(
      directRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP_TYPE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const:
              RELATIONSHIP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP_TYPE,
          },
        },
      },
    });
  }, 100000);
});
