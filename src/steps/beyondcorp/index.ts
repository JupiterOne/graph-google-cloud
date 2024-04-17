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
import { beyondcorpClient } from './client';
import {
  BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
  BEYONDCORP_APPLICATION_ENPOINT_CLASS,
  BEYONDCORP_APP_CONNECTION_CLASS,
  BEYONDCORP_APP_CONNECTION_TYPE,
  BEYONDCORP_APP_CONNECTOR_CLASS,
  BEYONDCORP_APP_CONNECTOR_TYPE,
  BEYONDCORP_ENTERPRISE_CLASS,
  BEYONDCORP_ENTERPRISE_PARTNER_TENANT_CLASS,
  BEYONDCORP_ENTERPRISE_PARTNER_TENANT_TYPE,
  BEYONDCORP_ENTERPRISE_TYPE,
  BEYONDCORP_GATEWAY_CLASS,
  BEYONDCORP_GATEWAY_TYPE,
  IngestionSources,
  RELATIONSHIP_TYPE_APPLICATION_ENDPOINT_USES_GATEWAY,
  RELATIONSHIP_TYPE_APP_CONNECTION_HAS_APPLICATION_ENDPOINT,
  RELATIONSHIP_TYPE_APP_CONNECTION_HAS_APP_CONNECTOR,
  RELATIONSHIP_TYPE_APP_CONNECTION_HAS_GATEWAY,
  RELATIONSHIP_TYPE_PROJECT_HAS_BEYONDCORP_ENTERPRISE,
  RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTION,
  RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTOR,
  STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP,
  STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP,
  STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP,
  STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP,
  STEP_BEYONDCORP_APPLICATION_ENDPOINT,
  STEP_BEYONDCORP_APP_CONNECTION,
  STEP_BEYONDCORP_APP_CONNECTOR,
  STEP_BEYONDCORP_ENTERPRISE,
  STEP_BEYONDCORP_GATEWAY,
  STEP_BEYONDCORP_PARTNER_TENANT,
  STEP_PROJECT_HAS_BEYONDCORP_ENTERPRISE_RELATIONSHIP,
  STEP_PROJECT_USES_APP_CONNECTION_RELATIONSHIP,
  STEP_PROJECT_USES_APP_CONNECTOR_RELATIONSHIP,
} from './constant';
import {
  createAppConnectionEntity,
  createAppConnectorEntity,
  createApplicationEndpointEntity,
  createBeyondcorpEnterpriseEntity,
  createGatewayEntity,
} from './converter';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { getProjectEntity } from '../../utils/project';

export async function fetchAppConnectors(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new beyondcorpClient({ config }, logger);

  try {
    await client.iterateAppConnector(async (appConnectors) => {
      await jobState.addEntity(
        createAppConnectorEntity(appConnectors, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'APP Connectors',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchAppConnections(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new beyondcorpClient({ config }, logger);

  try {
    await client.iterateAppConnection(async (appConnections) => {
      await jobState.addEntity(
        createAppConnectionEntity(appConnections, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'APP Connection',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchGateways(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new beyondcorpClient({ config }, logger);
  try {
    await client.iterateGatway(async (gateways) => {
      await jobState.addEntity(createGatewayEntity(gateways, client.projectId));
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'APP Gateway',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchApplicationEndpoint(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new beyondcorpClient({ config }, logger);
  const processedEndpoints = new Set();
  try {
    await client.iterateAppConnection(async (appConnections) => {
      const gateways = appConnections.gateway;
      const applicationEndpointData = appConnections.applicationEndpoint;
      const endpointKey = `${applicationEndpointData?.host}:${applicationEndpointData?.port}`;
      if (!processedEndpoints.has(endpointKey)) {
        processedEndpoints.add(endpointKey);

        await jobState.addEntity(
          createApplicationEndpointEntity(
            applicationEndpointData,
            client.projectId,
            gateways as Record<string, string>,
          ),
        );
      }
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Application Endpoint',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchPartnerTenant(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    //jobState,
    instance: { config },
    logger,
  } = context;

  const client = new beyondcorpClient({ config }, logger);
  try {
    await client.iteratePartnerTenantRule(async (tenant) => {});
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Enterprise Partner Tenant',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export async function fetchBeyondcorpEnterprise(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new beyondcorpClient({ config }, logger);
  const data = [];
  const organization_id = config.organizationId as string;
  await jobState.addEntity(
    createBeyondcorpEnterpriseEntity(organization_id, data, client.projectId),
  );
}

export async function buildApplicationEndpointUsesGatewayRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
    },
    async (endpoint) => {
      const gatewayKey = endpoint.gateway as string;

      if (!jobState.hasKey(gatewayKey)) {
        throw new IntegrationMissingKeyError(`
      Step Name : build application endpoint uses gateway relationship
      applicationEndpoint Key: ${gatewayKey}`);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: endpoint._key,
          fromType: BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
          toKey: gatewayKey,
          toType: BEYONDCORP_GATEWAY_TYPE,
        }),
      );
    },
  );
}

export async function buildAppConnectionHasAppConnectorRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: BEYONDCORP_APP_CONNECTION_TYPE,
    },
    async (connection) => {
      const connectors: string[] = connection.connector as string[];
      for (const connector of connectors || []) {
        if (!jobState.hasKey(connector)) {
          throw new IntegrationMissingKeyError(`
          Step Name : build app connection has app connector relationship
          connector Key: ${connector}`);
        }

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: connection._key as string,
            fromType: BEYONDCORP_APP_CONNECTION_TYPE,
            toKey: connector,
            toType: BEYONDCORP_APP_CONNECTOR_TYPE,
          }),
        );
      }
    },
  );
}

export async function buildAppConnectionHasApplicationEndpointRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: BEYONDCORP_APP_CONNECTION_TYPE,
    },
    async (connection) => {
      const endpointKey = (connection.endpointHost +
        '/' +
        connection.endpointPort) as string;

      if (!jobState.hasKey(endpointKey)) {
        throw new IntegrationMissingKeyError(`
          Step Name : build app connection has application endpoint relationship
          applicationEndpoint Key: ${endpointKey}`);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: connection._key as string,
          fromType: BEYONDCORP_APP_CONNECTION_TYPE,
          toKey: endpointKey,
          toType: BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
        }),
      );
    },
  );
}

export async function buildAppConnectionHasGatewayRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: BEYONDCORP_APP_CONNECTION_TYPE,
    },
    async (connection) => {
      const gateways = connection.gateway as string;

      if (!jobState.hasKey(gateways)) {
        throw new IntegrationMissingKeyError(`
          Step Name : build app connection has app gateway relationship
          applicationEndpoint Key: ${gateways}`);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: connection._key as string,
          fromType: BEYONDCORP_APP_CONNECTION_TYPE,
          toKey: gateways,
          toType: BEYONDCORP_GATEWAY_TYPE,
        }),
      );
    },
  );
}

export async function buildProjectUsesAppConnectorRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: BEYONDCORP_APP_CONNECTOR_TYPE },
    async (connectors) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: connectors._key as string,
          toType: BEYONDCORP_APP_CONNECTOR_TYPE,
        }),
      );
    },
  );
}

export async function buildProjectUsesAppConnectionRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: BEYONDCORP_APP_CONNECTION_TYPE },
    async (connections) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: connections._key as string,
          toType: BEYONDCORP_APP_CONNECTION_TYPE,
        }),
      );
    },
  );
}

export async function buildProjectHasBeyondcorpEnterpriseRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: BEYONDCORP_ENTERPRISE_TYPE },
    async (enterprise) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: enterprise._key as string,
          toType: BEYONDCORP_ENTERPRISE_TYPE,
        }),
      );
    },
  );
}

export const beyondcorpSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_BEYONDCORP_APP_CONNECTOR,
    ingestionSourceId: IngestionSources.BEYONDCORP_CONNECTORS,
    name: 'BeyondCrop app connector',
    entities: [
      {
        resourceName: 'BeyondCrop App connector',
        _type: BEYONDCORP_APP_CONNECTOR_TYPE,
        _class: BEYONDCORP_APP_CONNECTOR_CLASS,
        schema: {
          properties: {
            CIDR: { exclude: true },
            public: { exclude: true },
            internal: { exclude: true },
          },
        },
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAppConnectors,
    permissions: ['beyondcrop.appConnectors.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_BEYONDCORP_APP_CONNECTION,
    ingestionSourceId: IngestionSources.BEYONDCORP_CONNECTIONS,
    name: 'BeyondCrop app connection',
    entities: [
      {
        resourceName: 'BeyondCrop App connection',
        _type: BEYONDCORP_APP_CONNECTION_TYPE,
        _class: BEYONDCORP_APP_CONNECTION_CLASS,
        schema: {
          properties: {
            CIDR: { exclude: true },
            public: { exclude: true },
            internal: { exclude: true },
          },
        },
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAppConnections,
    permissions: ['beyondcrop.appConnections.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_BEYONDCORP_GATEWAY,
    ingestionSourceId: IngestionSources.BEYONDCORP_GATEWAYS,
    name: 'BeyondCrop gateways',
    entities: [
      {
        resourceName: 'BeyondCrop gateways',
        _type: BEYONDCORP_GATEWAY_TYPE,
        _class: BEYONDCORP_GATEWAY_CLASS,
        schema: {
          properties: {
            category: { exclude: true },
            public: { exclude: true },
            function: { exclude: true },
          },
        },
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchGateways,
    permissions: ['beyondcrop.appGateways.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_BEYONDCORP_APPLICATION_ENDPOINT,
    ingestionSourceId: IngestionSources.BEYONDCORP_APPLICATION_ENDPOINTS,
    name: 'BeyondCrop application Endpoints',
    entities: [
      {
        resourceName: 'BeyondCrop Application Endpoints',
        _type: BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
        _class: BEYONDCORP_APPLICATION_ENPOINT_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_BEYONDCORP_APP_CONNECTION],
    executionHandler: fetchApplicationEndpoint,
    permissions: [],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_BEYONDCORP_PARTNER_TENANT,
    ingestionSourceId: IngestionSources.BEYONDCORP_PARTNER_TENANT,
    name: 'BeyondCrop Enterprise Partner Tenant',
    entities: [
      {
        resourceName: 'BeyondCrop Enterprise Partner Tenant',
        _type: BEYONDCORP_ENTERPRISE_PARTNER_TENANT_TYPE,
        _class: BEYONDCORP_ENTERPRISE_PARTNER_TENANT_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchPartnerTenant,
    permissions: ['beyoncorp.partnerTenants.getIamPolicy'],
    apis: ['beyondcorp.googleapis.com', 'iam.googleapis.com'],
  },

  {
    id: STEP_BEYONDCORP_ENTERPRISE,
    ingestionSourceId: IngestionSources.BEYONDCORP_ENTERPRISE,
    name: 'BeyondCrop Enterprise',
    entities: [
      {
        resourceName: 'BeyondCrop Enterprise',
        _type: BEYONDCORP_ENTERPRISE_TYPE,
        _class: BEYONDCORP_ENTERPRISE_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchBeyondcorpEnterprise,
    permissions: [],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP,
    name: 'build app connection has app connector relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_APP_CONNECTION_HAS_APP_CONNECTOR,
        sourceType: BEYONDCORP_APP_CONNECTION_TYPE,
        targetType: BEYONDCORP_APP_CONNECTOR_TYPE,
      },
    ],
    dependsOn: [STEP_BEYONDCORP_APP_CONNECTION, STEP_BEYONDCORP_APP_CONNECTOR],
    executionHandler: buildAppConnectionHasAppConnectorRelationship,
    permissions: ['beyondcrop.appConnectors.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP,
    name: 'build app connection has application endpoint relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_APP_CONNECTION_HAS_APPLICATION_ENDPOINT,
        sourceType: BEYONDCORP_APP_CONNECTION_TYPE,
        targetType: BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
      },
    ],
    dependsOn: [
      STEP_BEYONDCORP_APP_CONNECTION,
      STEP_BEYONDCORP_APPLICATION_ENDPOINT,
    ],
    executionHandler: buildAppConnectionHasApplicationEndpointRelationship,
    permissions: ['beyondcrop.appConnectors.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP,
    ingestionSourceId: IngestionSources.APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP,
    name: 'build app connection has app gateway relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_APP_CONNECTION_HAS_GATEWAY,
        sourceType: BEYONDCORP_APP_CONNECTION_TYPE,
        targetType: BEYONDCORP_GATEWAY_TYPE,
      },
    ],
    dependsOn: [STEP_BEYONDCORP_APP_CONNECTION, STEP_BEYONDCORP_GATEWAY],
    executionHandler: buildAppConnectionHasGatewayRelationship,
    permissions: [
      'beyondcrop.appConnectors.list',
      'beyondcrop.appGateways.list',
    ],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_PROJECT_USES_APP_CONNECTOR_RELATIONSHIP,
    ingestionSourceId: IngestionSources.PROJECT_USES_APP_CONNECTOR_RELATIONSHIP,
    name: 'build project uses app connector relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTOR,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: BEYONDCORP_APP_CONNECTOR_TYPE,
      },
    ],
    dependsOn: [STEP_BEYONDCORP_APP_CONNECTOR, STEP_RESOURCE_MANAGER_PROJECT],
    executionHandler: buildProjectUsesAppConnectorRelationship,
    permissions: ['beyondcrop.appConnectors.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_PROJECT_USES_APP_CONNECTION_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.PROJECT_USES_APP_CONNECTION_RELATIONSHIP,
    name: 'build project uses app connection relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTION,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: BEYONDCORP_APP_CONNECTION_TYPE,
      },
    ],
    dependsOn: [STEP_BEYONDCORP_APP_CONNECTION, STEP_RESOURCE_MANAGER_PROJECT],
    executionHandler: buildProjectUsesAppConnectionRelationship,
    permissions: ['beyondcrop.appConnections.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP,
    name: 'build application endpoint uses gateway relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_APPLICATION_ENDPOINT_USES_GATEWAY,
        sourceType: BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
        targetType: BEYONDCORP_GATEWAY_TYPE,
      },
    ],
    dependsOn: [STEP_BEYONDCORP_APPLICATION_ENDPOINT, STEP_BEYONDCORP_GATEWAY],
    executionHandler: buildApplicationEndpointUsesGatewayRelationship,
    permissions: ['beyondcrop.appConnections.list'],
    apis: ['beyondcorp.googleapis.com'],
  },

  {
    id: STEP_PROJECT_HAS_BEYONDCORP_ENTERPRISE_RELATIONSHIP,
    ingestionSourceId: IngestionSources.PROJECT_HAS_BEYONDCORP_ENTERPRISE,
    name: 'build project has beyondcorp enterprise relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_BEYONDCORP_ENTERPRISE,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: BEYONDCORP_ENTERPRISE_TYPE,
      },
    ],
    dependsOn: [STEP_BEYONDCORP_ENTERPRISE, STEP_RESOURCE_MANAGER_PROJECT],
    executionHandler: buildProjectHasBeyondcorpEnterpriseRelationship,
    permissions: [],
    apis: ['beyondcorp.googleapis.com'],
  },
];
