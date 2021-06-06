import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { apigateway_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_API_GATEWAY_API,
  ENTITY_TYPE_API_GATEWAY_API,
  ENTITY_CLASS_API_GATEWAY_API_CONFIG,
  ENTITY_TYPE_API_GATEWAY_API_CONFIG,
  ENTITY_CLASS_API_GATEWAY_GATEWAY,
  ENTITY_TYPE_API_GATEWAY_GATEWAY,
} from './constants';

export function createApiGatewayApiEntity({
  data,
  projectId,
  isPublic,
}: {
  data: apigateway_v1.Schema$ApigatewayApi;
  projectId: string;
  isPublic: boolean;
}) {
  const apiId = data.name?.split('/')[5];

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_API_GATEWAY_API,
        _type: ENTITY_TYPE_API_GATEWAY_API,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        function: ['api-gateway'],
        state: data.state,
        category: ['network'],
        public: isPublic,
        managedService: data.managedService,
        webLink: getGoogleCloudConsoleWebLink(
          `/api-gateway/api/${apiId}/servicename/${data.managedService}/overview?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export function createApiGatewayApiConfigEntity({
  data,
  apiId,
  apiManagedService,
  projectId,
  isPublic,
}: {
  data: apigateway_v1.Schema$ApigatewayApiConfig;
  apiId: string;
  apiManagedService: string;
  projectId: string;
  isPublic: boolean;
}) {
  const configId = data.name?.split('/')[7];

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_API_GATEWAY_API_CONFIG,
        _type: ENTITY_TYPE_API_GATEWAY_API_CONFIG,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        state: data.state,
        public: isPublic,
        webLink: getGoogleCloudConsoleWebLink(
          `/api-gateway/api/${apiId}/servicename/${apiManagedService}/configs/${configId}/rollout/${data.serviceConfigId}/details?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export function createApiGatewayGatewayEntity({
  data,
  projectId,
  isPublic,
}: {
  data: apigateway_v1.Schema$ApigatewayGateway;
  projectId: string;
  isPublic: boolean;
}) {
  const gatewayId = data.name?.split('/')[5];
  const location = data.name?.split('/')[3];

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_API_GATEWAY_GATEWAY,
        _type: ENTITY_TYPE_API_GATEWAY_GATEWAY,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        defaultHostname: data.defaultHostname,
        state: data.state,
        category: ['network'],
        function: ['api-gateway'],
        public: isPublic,
        webLink: getGoogleCloudConsoleWebLink(
          `/api-gateway/gateway/${gatewayId}/location/${location}?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}
