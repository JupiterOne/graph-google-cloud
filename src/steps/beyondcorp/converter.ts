import { beyondcorp_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
  BEYONDCORP_APPLICATION_ENPOINT_CLASS,
  BEYONDCORP_APP_CONNECTION_CLASS,
  BEYONDCORP_APP_CONNECTION_TYPE,
  BEYONDCORP_APP_CONNECTOR_CLASS,
  BEYONDCORP_APP_CONNECTOR_TYPE,
  BEYONDCORP_ENTERPRISE_CLASS,
  BEYONDCORP_ENTERPRISE_TYPE,
  BEYONDCORP_GATEWAY_CLASS,
  BEYONDCORP_GATEWAY_TYPE,
} from './constant';

export function createAppConnectorEntity(
  data: beyondcorp_v1.Schema$GoogleCloudBeyondcorpAppconnectorsV1AppConnector,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: BEYONDCORP_APP_CONNECTOR_TYPE,
        _class: BEYONDCORP_APP_CONNECTOR_CLASS,
        createdTime: data.createTime,
        name: data.name,
        updatedTime: data.updateTime,
        UID: data.uid,
        State: data.state,
      },
    },
  });
}

export function createAppConnectionEntity(
  data: beyondcorp_v1.Schema$GoogleCloudBeyondcorpAppconnectionsV1AppConnection,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: BEYONDCORP_APP_CONNECTION_TYPE,
        _class: BEYONDCORP_APP_CONNECTION_CLASS,
        name: data.name,
        createdTime: data.createTime,
        gateway: data.gateway?.appGateway,
        connector: data.connectors,
        uid: data.uid,
        type: data.type,
        updatedTime: data.updateTime,
        state: data.state,
        endpointHost: data.applicationEndpoint?.host,
        endpointPort: data.applicationEndpoint?.port,
      },
    },
  });
}

export function createGatewayEntity(
  data: beyondcorp_v1.Schema$AppGateway,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: BEYONDCORP_GATEWAY_TYPE,
        _class: BEYONDCORP_GATEWAY_CLASS,
        uid: data.uid,
        state: data.state,
        type: data.type,
        hostType: data.hostType,
      },
    },
  });
}

export function createApplicationEndpointEntity(
  data,
  projectId: string,
  gateways: Record<string, string>,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: (data.host + '/' + data.port) as string,
        _type: BEYONDCORP_APPLICATION_ENDPOINT_TYPE,
        _class: BEYONDCORP_APPLICATION_ENPOINT_CLASS,
        hostName: data.host,
        portNumber: data.port,
        gateway: gateways.appGateway,
        name: data.host,
      },
    },
  });
}

export function createBeyondcorpEnterpriseEntity(
  organizationId: string,
  data: any,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: (organizationId + '_' + BEYONDCORP_ENTERPRISE_TYPE) as string,
        _type: BEYONDCORP_ENTERPRISE_TYPE,
        _class: BEYONDCORP_ENTERPRISE_CLASS,
        name: 'Beyondcorp Enterprise Service',
        function: ['Networking'],
        category: ['Security', 'Network'],
        endpoint: 'http://console.cloud.google.com/',
      },
    },
  });
}
