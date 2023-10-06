import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { apigateway_v1 } from 'googleapis';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
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
  RELATIONSHIP_TYPE_API_GATEWAY_API_CONFIG_USES_SERVICE_ACCOUNT,
} from './constants';
import {
  createApiGatewayApiConfigEntity,
  createApiGatewayApiEntity,
  createApiGatewayGatewayEntity,
} from './converters';
import {
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  STEP_IAM_SERVICE_ACCOUNTS,
} from '../iam/constants';

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
    logger,
  } = context;

  const client = new ApiGatewayClient({ config }, logger);

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
    logger,
  } = context;

  const client = new ApiGatewayClient({ config }, logger);

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

        if (
          apiConfig.gatewayServiceAccount?.includes('iam.gserviceaccount.com')
        ) {
          const serviceAccountId =
            apiConfig.gatewayServiceAccount.split('/')[3];

          const serviceAccountEntity = await jobState.findEntity(
            serviceAccountId,
          );
          if (serviceAccountEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: apiConfigEntity,
                to: serviceAccountEntity,
              }),
            );
          }
        } else {
          // NOTE: It's not clear exactly when this case would happen.
          // The following log message is to provide some clarity around
          // how frequently we see this case and whether we should
          // iterate on it further.
          logger.warn(
            {
              fullResourceName: apiConfig.gatewayServiceAccount,
            },
            'The service account that api gateway should use to authenticate to the other services is using its full resource name',
          );
        }
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
    logger,
  } = context;

  const client = new ApiGatewayClient({ config }, logger);

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

export const apiGatewaySteps: GoogleCloudIntegrationStep[] = [
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
    permissions: ['apigateway.apis.getIamPolicy', 'apigateway.apis.list'],
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
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_API_GATEWAY_API_CONFIG_USES_SERVICE_ACCOUNT,
        sourceType: ENTITY_TYPE_API_GATEWAY_API_CONFIG,
        targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_API_GATEWAY_APIS, STEP_IAM_SERVICE_ACCOUNTS],
    executionHandler: fetchApiGatewayApiConfigs,
    permissions: [
      'apigateway.apiconfigs.list',
      'apigateway.apiconfigs.getIamPolicy',
    ],
    apis: ['apigateway.googleapis.com'],
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
    permissions: [
      'apigateway.gateways.list',
      'apigateway.gateways.getIamPolicy',
    ],
    apis: ['apigateway.googleapis.com'],
  },
];
