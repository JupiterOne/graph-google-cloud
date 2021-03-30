import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { apigateway_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { isMemberPublic } from '../../utils/iam';
import { ApiGatewayClient } from './client';
import {
  STEP_API_GATEWAY_APIS,
  STEP_API_GATEWAY_GATEWAYS,
  STEP_API_GATEWAY_API_CONFIGS,
  ENTITY_CLASS_API_GATEWAY_API,
  ENTITY_TYPE_API_GATEWAY_API,
  ENTITY_TYPE_API_GATEWAY_API_CONFIG,
  ENTITY_CLASS_API_GATEWAY_API_CONFIG,
  ENTITY_TYPE_API_GATEWAY_GATEWAY,
  ENTITY_CLASS_API_GATEWAY_GATEWAY,
  RELATIONSHIP_TYPE_API_GATEWAY_API_USES_CONFIG,
  RELATIONSHIP_TYPE_API_GATEWAY_API_HAS_GATEWAY,
} from './constants';
import {
  createApiGatewayApiConfigEntity,
  createApiGatewayApiEntity,
  createApiGatewayGatewayEntity,
} from './converters';

function isApiGatewayPolicyPublicAccess(
  policy: apigateway_v1.Schema$ApigatewayPolicy,
): boolean {
  for (const binding of policy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchApiGatewayApis(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new ApiGatewayClient({ config });

  await client.iterateApis(async (api) => {
    const apiId = api.name?.split('/')[5];
    const apiPolicy = await client.getApiPolicy(apiId as string);
    const apiEntity = createApiGatewayApiEntity({
      data: api,
      projectId: client.projectId,
      isPublic: isApiGatewayPolicyPublicAccess(apiPolicy),
    });
    await jobState.addEntity(apiEntity);
  });
}

export async function fetchApiGatewayApiConfigs(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new ApiGatewayClient({ config });

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_API_GATEWAY_API,
    },
    async (apiEntity) => {
      const apiId = apiEntity._key.split('/')[5];
      await client.iterateApiConfigs(apiId, async (apiConfig) => {
        const configId = apiConfig.name?.split('/')[7];
        const configPolicy = await client.getApiConfigPolicy(
          apiId,
          configId as string,
        );
        const apiConfigEntity = createApiGatewayApiConfigEntity({
          data: apiConfig,
          apiId: (apiEntity.name as string).split('/')[5],
          apiManagedService: apiEntity.managedService as string,
          projectId: client.projectId,
          isPublic: isApiGatewayPolicyPublicAccess(configPolicy),
        });

        await jobState.addEntity(apiConfigEntity);

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: apiEntity,
            to: apiConfigEntity,
          }),
        );
      });
    },
  );
}

export async function fetchApiGatewayGateways(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new ApiGatewayClient({ config });

  await client.iterateGateways(async (gateway) => {
    const gatewayId = gateway.name?.split('/')[5];
    const gatewayPolicy = await client.getGatewayPolicy(gatewayId as string);

    const gatewayEntity = createApiGatewayGatewayEntity({
      data: gateway,
      projectId: client.projectId,
      isPublic: isApiGatewayPolicyPublicAccess(gatewayPolicy),
    });

    await jobState.addEntity(gatewayEntity);
    const apiId = gateway.apiConfig?.split('/')[5];

    const apiEntity = await jobState.findEntity(
      `projects/${client.projectId}/locations/global/apis/${apiId}`,
    );
    if (apiEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: apiEntity,
          to: gatewayEntity,
        }),
      );
    }
  });
}

export const apiGatewaySteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_API_GATEWAY_APIS,
    name: 'Api Gateway APIs',
    entities: [
      {
        resourceName: 'Api Gateway Api',
        _type: ENTITY_TYPE_API_GATEWAY_API,
        _class: ENTITY_CLASS_API_GATEWAY_API,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchApiGatewayApis,
  },
  {
    id: STEP_API_GATEWAY_API_CONFIGS,
    name: 'Api Gateway Api Configs',
    entities: [
      {
        resourceName: 'Api Gateway Api Config',
        _type: ENTITY_TYPE_API_GATEWAY_API_CONFIG,
        _class: ENTITY_CLASS_API_GATEWAY_API_CONFIG,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_API_GATEWAY_API_USES_CONFIG,
        sourceType: ENTITY_TYPE_API_GATEWAY_API,
        targetType: ENTITY_TYPE_API_GATEWAY_API_CONFIG,
      },
    ],
    dependsOn: [STEP_API_GATEWAY_APIS],
    executionHandler: fetchApiGatewayApiConfigs,
  },
  {
    id: STEP_API_GATEWAY_GATEWAYS,
    name: 'Api Gateway Gateways',
    entities: [
      {
        resourceName: 'Api Gateway Gateway',
        _type: ENTITY_TYPE_API_GATEWAY_GATEWAY,
        _class: ENTITY_CLASS_API_GATEWAY_GATEWAY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_API_GATEWAY_API_HAS_GATEWAY,
        sourceType: ENTITY_TYPE_API_GATEWAY_API,
        targetType: ENTITY_TYPE_API_GATEWAY_GATEWAY,
      },
    ],
    dependsOn: [STEP_API_GATEWAY_APIS],
    executionHandler: fetchApiGatewayGateways,
  },
];
