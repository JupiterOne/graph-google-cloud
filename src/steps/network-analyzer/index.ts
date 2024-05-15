import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { publishUnsupportedConfigEvent } from '../../utils/events';
import { networkAnalyzerClient } from './client';
import {
  IngestionSources,
  STEP_NETWORK_ANALYZER_VPC,
  STEP_NETWORK_INTELLIGENCE_CENTER,
  NETWORK_INTELLIGENCE_CENTER_TYPE,
  NETWORK_INTELLIGENCE_CENTER_CLASS,
  STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP,
  RELATIONSHIP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_TYPE,
  STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
  NETWORK_ANALYZER_CONNECTIVITY_TEST_CLASS,
  NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
  STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
  RELATIONSHIP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
  STEP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
  RELATIONSHIP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
  STEP_VPN_GATEWAY_TUNNEL,
  STEP_VPN_GATEWAY,
  STEP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP,
  RELATIONSHIP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP_TYPE,
  VPN_GATEWAY_TYPE,
  VPN_GATEWAY_TUNNEL_TYPE,
  Network_Analyzer_Permission,
  NETWORK_ANALYZER_VPC_TYPE,
  NETWORK_ANALYZER_VPC_CLASS,
  STEP_CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP,
  CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP_TYPE,
  STEP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP,
  RELATIONSHIP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP_TYPE,
} from './constants';
import {
  createNetworkAnalyzerConnectivityTest,
  createNetworkAnalyzerVpc,
  createNetworkIntelligenceCenterEntity,
  createVpnGateway,
  createVpnGatewayTunnel,
} from './converter';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { getProjectEntity } from '../../utils/project';

export interface VpcConnector {
  displayName: string;
  uri: string;
  location: string;
}

function findVpcConnector(obj: any): VpcConnector | null {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  if ('vpcConnector' in obj) {
    const connector = obj['vpcConnector'];
    if (
      connector &&
      typeof connector === 'object' &&
      'displayName' in connector &&
      'uri' in connector &&
      'location' in connector
    ) {
      return connector;
    }
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findVpcConnector(obj[key]);
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}

export async function fetchNetworkIntelligenceCenter(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new networkAnalyzerClient({ config }, logger);
  try {
    await client.iterateNetworkIntelligenceCenter(async (location) => {
      await jobState.addEntity(
        createNetworkIntelligenceCenterEntity(location, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Network Intelligence Center',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function buildProjectHasNetworkIntelligenceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: NETWORK_INTELLIGENCE_CENTER_TYPE },
    async (locations) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: locations._key as string,
          toType: NETWORK_INTELLIGENCE_CENTER_TYPE,
        }),
      );
    },
  );
}

export async function buildNetworkIntelligenceCenterHasNetworkAnalyzerConnectivityTestRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (connectivityLocation) => {
      const locationKey =
        'projects/j1-gc-integration-dev-v3/locations/' +
        (connectivityLocation.name as string).split('/')[3];

      if (!jobState.hasKey(locationKey)) {
        throw new IntegrationMissingKeyError(`
              Step Name : build network Intelligence center has network analyzer connectivity test
              applicationEndpoint Key: ${locationKey}`);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: locationKey as string,
            fromType: NETWORK_INTELLIGENCE_CENTER_TYPE,
            toKey: connectivityLocation._key as string,
            toType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
          }),
        );
      }
    },
  );
}

export async function fetchNetworkAnalyzerConnectivityTest(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new networkAnalyzerClient({ config }, logger);
  try {
    await client.iterateNetworkAnalyzerConnectivityTest(
      async (connectivityTest) => {
        await jobState.addEntity(
          createNetworkAnalyzerConnectivityTest(
            connectivityTest,
            client.projectId,
          ),
        );
      },
    );
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Network Analyzer Connectivity Test',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchVpnGatewayTunnel(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new networkAnalyzerClient({ config }, logger);
  try {
    await client.iterateVpnGatewayTunnel(async (vpnGatewayTunnel) => {
      await jobState.addEntity(
        createVpnGatewayTunnel(vpnGatewayTunnel, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'VPN Gateway Tunnel',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function buildProjectHasNetworkAnalyzerConnectivityTestRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  const projectEntity = await getProjectEntity(jobState);
  if (!projectEntity) return;
  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE },
    async (locations) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: locations._key as string,
          toType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
        }),
      );
    },
  );
}

export async function fetchNetworkAnalyzerVpc(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new networkAnalyzerClient({ config }, logger);
  try {
    await client.iterateNetworkAnalyzerConnectivityTest(
      async (connectivityTest) => {
        const vpcConnector = findVpcConnector(connectivityTest);
        if (vpcConnector) {
          await jobState.addEntity(
            createNetworkAnalyzerVpc(
              vpcConnector,
              client.projectId,
              connectivityTest.name!,
            ),
          );
        }
      },
    );
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'VPC Connector',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchVpnGateway(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new networkAnalyzerClient({ config }, logger);
  try {
    await client.iterateVpnGateway(async (vpnGatewayTunnel) => {
      await jobState.addEntity(
        createVpnGateway(vpnGatewayTunnel, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'VPN Gateway Tunnel',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function buildVpnGatewayVpnGatewayTunnelRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: VPN_GATEWAY_TUNNEL_TYPE },
    async (tunnel) => {
      const url = tunnel.vpnGatewayName as string;
      if (typeof url === 'string') {
        const completeName = url.split('/');
        const vpnGatewayKey = completeName[completeName.length - 1];

        if (jobState.hasKey(vpnGatewayKey)) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.USES,
              fromKey: vpnGatewayKey as string,
              fromType: VPN_GATEWAY_TYPE,
              toKey: tunnel._key as string,
              toType: VPN_GATEWAY_TUNNEL_TYPE,
            }),
          );
        } else {
          throw new IntegrationMissingKeyError(
            `Build VPN Gateway USES VPN Gateway Tunnel: ${vpnGatewayKey} Missing.`,
          );
        }
      }
    },
  );
}

export async function buildConnectivityTestUsesVpcRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_VPC_TYPE },
    async (vpcConnector) => {
      const testConnectionName = vpcConnector.connectivityTestName as string;
      if (jobState.hasKey(testConnectionName)) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromKey: testConnectionName,
            fromType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
            toKey: vpcConnector._key as string,
            toType: NETWORK_ANALYZER_VPC_TYPE,
          }),
        );
      } else {
        throw new IntegrationMissingKeyError(
          `Build Connectivity Test Uses VPC. ConnectivityTest: ${testConnectionName} Missing.`,
        );
      }
    },
  );
}

export async function buildProjectUsesNetworkAnalyzerVPCRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: NETWORK_ANALYZER_VPC_TYPE },
    async (networkAnalyzerVpc) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: networkAnalyzerVpc._key as string,
          toType: NETWORK_ANALYZER_VPC_TYPE,
        }),
      );
    },
  );
}

export const networkAnalyzerSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_NETWORK_INTELLIGENCE_CENTER,
    ingestionSourceId: IngestionSources.NETWORK_INTELLIGENCE_CENTER,
    name: 'Network Intelligence Center',
    entities: [
      {
        resourceName: 'Network Intelligence Center',
        _type: NETWORK_INTELLIGENCE_CENTER_TYPE,
        _class: NETWORK_INTELLIGENCE_CENTER_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchNetworkIntelligenceCenter,
    permissions: Network_Analyzer_Permission.STEP_NETWORK_INTELLIGENCE_CENTER,
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP,
    name: 'Project HAS Network Intelligence Center',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: NETWORK_INTELLIGENCE_CENTER_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_NETWORK_INTELLIGENCE_CENTER,
    ],
    executionHandler: buildProjectHasNetworkIntelligenceRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
    ingestionSourceId: IngestionSources.NETWORK_ANALYZER_CONNECTIVITY_TEST,
    name: 'Network Analyzer Connectivity Test',
    entities: [
      {
        resourceName: 'Network Intelligence Center',
        _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
        _class: NETWORK_ANALYZER_CONNECTIVITY_TEST_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchNetworkAnalyzerConnectivityTest,
    permissions:
      Network_Analyzer_Permission.STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
    name: 'Project HAS Network Analyzer Connectivity Test',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
    ],
    executionHandler:
      buildProjectHasNetworkAnalyzerConnectivityTestRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP,
    name: 'Network Intelligence Center HAS Network Analyzer Connectivity Test',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type:
          RELATIONSHIP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
        sourceType: NETWORK_INTELLIGENCE_CENTER_TYPE,
        targetType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
      },
    ],
    dependsOn: [
      STEP_NETWORK_INTELLIGENCE_CENTER,
      STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
    ],
    executionHandler:
      buildNetworkIntelligenceCenterHasNetworkAnalyzerConnectivityTestRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_VPN_GATEWAY_TUNNEL,
    ingestionSourceId: IngestionSources.VPN_GATEWAY_TUNNEL,
    name: 'VPN Gateway Tunnel',
    entities: [],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchVpnGatewayTunnel,
    permissions: Network_Analyzer_Permission.STEP_VPN_GATEWAY_TUNNEL,
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_NETWORK_ANALYZER_VPC,
    ingestionSourceId: IngestionSources.NETWORK_ANALYZER_VPC,
    name: 'Network Analyzer VPC',
    entities: [
      {
        resourceName: 'Network Analyzer VPC',
        _type: NETWORK_ANALYZER_VPC_TYPE,
        _class: NETWORK_ANALYZER_VPC_CLASS,
        schema: {
          properties: {
            name: { type: 'string' },
            uri: { type: 'string' },
            location: { type: 'string' },
            internal: { exclude: true },
            public: { exclude: true },
            CIDR: { exclude: true },
          },
        },
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchNetworkAnalyzerVpc,
    permissions:
      Network_Analyzer_Permission.STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_VPN_GATEWAY,
    ingestionSourceId: IngestionSources.VPN_GATEWAY,
    name: 'VPN Gateway',
    entities: [],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchVpnGateway,
    permissions: Network_Analyzer_Permission.STEP_VPN_GATEWAY,
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP,
    name: 'VPN Gateway USES VPN Gateway Tunnel',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type:
          RELATIONSHIP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP_TYPE,
        sourceType: VPN_GATEWAY_TYPE,
        targetType: VPN_GATEWAY_TUNNEL_TYPE,
      },
    ],
    dependsOn: [STEP_VPN_GATEWAY, STEP_VPN_GATEWAY_TUNNEL],
    executionHandler: buildVpnGatewayVpnGatewayTunnelRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP,
    ingestionSourceId: IngestionSources.CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP,
    name: 'Connectivity Test Uses VPC',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP_TYPE,
        sourceType: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
        targetType: NETWORK_ANALYZER_VPC_TYPE,
      },
    ],
    dependsOn: [
      STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST,
      STEP_NETWORK_ANALYZER_VPC,
    ],
    executionHandler: buildConnectivityTestUsesVpcRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
  {
    id: STEP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP,
    name: 'Project Uses Network Analyzer VPC',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP_TYPE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: STEP_NETWORK_ANALYZER_VPC,
      },
    ],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_NETWORK_ANALYZER_VPC],
    executionHandler: buildProjectUsesNetworkAnalyzerVPCRelationship,
    permissions: [],
    apis: ['networkmanagement.googleapis.com'],
  },
];
