import { networkmanagement_v1, compute_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  NETWORK_INTELLIGENCE_CENTER_CLASS,
  NETWORK_INTELLIGENCE_CENTER_TYPE,
  NETWORK_ANALYZER_CONNECTIVITY_TEST_CLASS,
  NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
  VPN_GATEWAY_TUNNEL_TYPE,
  VPN_GATEWAY_TUNNEL_CLASS,
  VPN_GATEWAY_TYPE,
  VPN_GATEWAY_CLASS
} from './constants';

export function createNetworkIntelligenceCenterEntity(
  data: networkmanagement_v1.Schema$Location,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: NETWORK_INTELLIGENCE_CENTER_TYPE,
        _class: NETWORK_INTELLIGENCE_CENTER_CLASS,
        name: data.name,
        category: ['network'],
        function: ['networking'],
        locationId: data.locationId,
        projectId: projectId
      },
    },
  });
}

export function createNetworkAnalyzerConnectivityTest(
  data: networkmanagement_v1.Schema$ConnectivityTest,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE,
        _class: NETWORK_ANALYZER_CONNECTIVITY_TEST_CLASS,
        name: data.name,
        projectId: projectId,
        displayName: data.displayName as string,
        category: data.protocol as string,
        summary: data.probingDetails?.result as string,
        internal: true
      },
    },
  });
}

export function createVpnGatewayTunnel(
  data: compute_v1.Schema$VpnTunnel,
  projectId: string,
) {
  // Extracting the VPN gateway name from the URL
  let vpnGatewayName = '';

  // Checking if data.vpnGateway is not null or undefined
  if (data.vpnGateway) {
    // Extracting the VPN gateway name from the URL
    vpnGatewayName = data.vpnGateway.split('/').pop() || '';
  }
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: VPN_GATEWAY_TUNNEL_TYPE,
        _class: VPN_GATEWAY_TUNNEL_CLASS,
        name: data.name,
        projectId: projectId,
        summary: data.description,
        public: true,
        kind: data.kind,
        category: ['network'],
        function: ['routing'],
        vpnGatewayName: vpnGatewayName
      },
    },
  });
}

export function createNetworkAnalyzerVpc(
  data: compute_v1.Schema$VpnTunnel,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: VPN_GATEWAY_TUNNEL_TYPE,
        _class: VPN_GATEWAY_TUNNEL_CLASS,
        name: data.name,
        projectId: projectId,
        summary: data.description,
        public: true,
        kind: data.kind,
        category: ['network'],
        function: ['routing'],
      },
    },
  });
}

export function createVpnGateway(
  data: compute_v1.Schema$VpnGateway,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.id as string,
        _type: VPN_GATEWAY_TYPE,
        _class: VPN_GATEWAY_CLASS,
        name: data.name,
        projectId: projectId,
        summary: data.description,
        public: true,
        kind: data.kind,
        category: ['network'],
        function: ['routing','remote-access-gateway'],
      },
    },
  });
}