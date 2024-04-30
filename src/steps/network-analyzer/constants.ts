export const NETWORK_ANALYZER_VPC_CLASS = ['Network'];
export const NETWORK_ANALYZER_VPC_TYPE = 'google_cloud_network_analyzer_vpc';
export const STEP_NETWORK_ANALYZER_VPC = 'fetch-network-analyzer-vpc';

export const NETWORK_ANALYZER_CONNECTIVITY_TEST_CLASS = ['Assessment'];
export const NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE =
  'google_cloud_network_analyzer_connectivity_test';
export const STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST =
  'fetch-network-analyzer-connectivity-test';

export const NETWORK_INTELLIGENCE_CENTER_CLASS = ['Service'];
export const NETWORK_INTELLIGENCE_CENTER_TYPE = 'google_cloud_network_analyzer';
export const STEP_NETWORK_INTELLIGENCE_CENTER = 'fetch-cloud-network-analyzer';

export const VPN_GATEWAY_CLASS = ['Gateway'];
export const VPN_GATEWAY_TYPE = 'google_cloud_vpn_gateway';
export const STEP_VPN_GATEWAY = 'fetch-cloud-vpn-gateway';

export const VPN_GATEWAY_TUNNEL_CLASS = ['Gateway'];
export const VPN_GATEWAY_TUNNEL_TYPE = 'google_cloud_vpn_tunnel';
export const STEP_VPN_GATEWAY_TUNNEL = 'fetch-cloud-vpn-gateway-tunnel';

export const STEP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP =
  'fetch-project-has-network-intelligence-center-relation';
export const RELATIONSHIP_PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_TYPE =
  'google_cloud_project_has_network_analyzer';

export const STEP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP =
  'fetch-network-intelligence-center-has-network-analyzer-connectivity-test-relation';
export const RELATIONSHIP_NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE =
  'google_cloud_network_analyzer_has_network_analyzer_connectivity_test_type';

export const STEP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP =
  'fetch-project-has-network-analyzer-connectivity-test-relation';
export const RELATIONSHIP_PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_TYPE =
  'google_cloud_project_has_network_analyzer_connectivity_test';

export const STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP =
  'fetch-network-analyzer-connectivity-test-uses-network-analyzer-vpc-relation';
export const RELATIONSHIP_NETWORK_ANALYZER_CONNECTIVITY_TEST_USES_NETWORK_ANALYZER_VPC_TYPE =
  'google_cloud_network_analyzer_connectivity_test_uses_google_cloud_network_analyzer_vpc';

export const STEP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP =
  'fetch-project-uses-network-analyzer-vpc-relation';
export const RELATIONSHIP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP_TYPE =
  'google_cloud_project_uses_google_cloud_network_analyzer_vpc';

export const STEP_NETWORK_ANALYZER_VPC_USES_VPN_GATEWAY_RELATIONSHIP =
  'fetch-network-analyzer-vpc-uses-vpn-gateway-relation';
export const RELATIONSHIP_NETWORK_ANALYZER_VPC_USES_VPN_GATEWAY_RELATIONSHIP_TYPE =
  'google_cloud_network_analyzer_vpc_uses_vpn_gateway';

export const STEP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP =
  'fetch-vpn-gateway-uses-vpn-gateway-tunnel-relation';
export const RELATIONSHIP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP_TYPE =
  'google_cloud_vpn_gateway_uses_google_cloud_vpn_tunnel';

export const IngestionSources = {
  NETWORK_INTELLIGENCE_CENTER: 'network-intelligence-center',
  PROJECT_HAS_NETWORK_INTELLIGENCE_CENTER_RELATIONSHIP:
    'project-has-network-intelligence-center-relation',
  NETWORK_ANALYZER_CONNECTIVITY_TEST: 'network-analyzer-connectivity-test',
  NETWORK_ANALYZER_CONNECTIVITY_TEST_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP:
    'network-analyzer-connectivity-test-relation-uses-network-analyzer-vpc-relation',
  PROJECT_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP:
    'project-has-network-analyzer-connectivity-test-relation',
  NETWORK_INTELLIGENCE_CENTER_HAS_NETWORK_ANALYZER_CONNECTIVITY_TEST_RELATIONSHIP:
    'network-intelligence-center-hasnetwork-analyzer-connectivity-test-relation',
  VPN_GATEWAY_TUNNEL: 'vpn-gateway-tunnel',
  NETWORK_ANALYZER_VPC: 'network-analyzer-vpc',
  PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP:
    'project-uses-network-analyzer-vpc-relation',
  NETWORK_ANALYZER_VPC_USES_VPN_GATEWAY_RELATIONSHIP:
    'network-analyzer-vpc-uses-vpn-gateway-relation',
  VPN_GATEWAY: 'vpn-gateway',
  VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP:
    'vpn-gateway-uses-vpn-gateway-tunnel',
};

export const NETWORK_ANALYZER_LOCATIONS: string[] = [
  'africa-south1',
  'asia-east1',
  'asia-east2',
  'asia-northeast1',
  'asia-northeast2',
  'asia-northeast3',
  'asia-south1',
  'asia-south2',
  'asia-southeast1',
  'asia-southeast2',
  'australia-southeast1',
  'australia-southeast2',
  'europe-central2',
  'europe-north1',
  'europe-southwest1',
  'europe-west1',
  'europe-west10',
  'europe-west12',
  'europe-west2',
  'europe-west3',
  'europe-west4',
  'europe-west6',
  'europe-west8',
  'europe-west9',
  'me-central1',
  'me-central2',
  'me-west1',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us-central1',
  'us-east1',
  'us-east4',
  'us-east5',
  'us-south1',
  'us-west1',
  'us-west2',
  'us-west3',
  'us-west4',
];

export const Network_Analyzer_Permission = {
  STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST: [],
  STEP_NETWORK_INTELLIGENCE_CENTER: [],
  STEP_VPN_GATEWAY: [],
  STEP_VPN_GATEWAY_TUNNEL: [],
};
