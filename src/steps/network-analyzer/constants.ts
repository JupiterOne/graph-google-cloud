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

export const RELATIONSHIP_NETWORK_ANALYZER_CONNECTIVITY_TEST_USES_NETWORK_ANALYZER_VPC_TYPE =
  'google_cloud_network_analyzer_connectivity_test_uses_google_cloud_network_analyzer_vpc';

export const STEP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP =
  'fetch-project-uses-network-analyzer-vpc-relation';
export const RELATIONSHIP_PROJECT_USES_NETWORK_ANALYZER_VPC_RELATIONSHIP_TYPE =
  'google_cloud_project_uses_network_analyzer_vpc';

export const RELATIONSHIP_NETWORK_ANALYZER_VPC_USES_VPN_GATEWAY_RELATIONSHIP_TYPE =
  'google_cloud_network_analyzer_vpc_uses_vpn_gateway';

export const STEP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP =
  'fetch-vpn-gateway-uses-vpn-gateway-tunnel-relation';
export const RELATIONSHIP_VPN_GATEWAY_USES_VPN_GATEWAY_TUNNEL_RELATIONSHIP_TYPE =
  'google_cloud_vpn_gateway_uses_google_cloud_vpn_tunnel';

export const STEP_CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP =
  'build-connectivity-test-uses-vpc-relationship';
export const CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP_TYPE =
  'google_cloud_network_analyzer_connectivity_test_uses_vpc';

export const STEP_CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE =
  'build-connectivity-test-scans-compute-instance-relationship';
export const RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE =
  'google_cloud_network_analyzer_connectivity_test_scans_compute_instance';
export const STEP_CONNECTIVITY_TEST_SCANS_FORWARDING_RULE =
  'build-connectivity-test-scans-forwarding-rule-relationship';
export const RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_FORWARDING_RULE =
  'google_cloud_network_analyzer_connectivity_test_scans_compute_forwarding_rule';

export const STEP_CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE =
  'build-connectivity-test-scans-cloud-sql-relationship';
export const RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE =
  'google_cloud_network_analyzer_connectivity_test_scans_sql_mysql_instance';

export const STEP_CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION =
  'build-connectivity-test-scans-cloud-function-relationship';
export const RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION =
  'google_cloud_network_analyzer_connectivity_test_scans_function';

export const RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION =
  'google_cloud_network_analyzer_connectivity_test_scans_app_engine_version';

export const STEP_CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION =
  'build-connectivity-test-scans-app-engine-version';

export const STEP_CONNECTIVITY_TEST_SCANS_NETWORK =
  'build-connectivity-test-scans-network';
export const RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_NETWORK =
  'google_cloud_network_analyzer_connectivity_test_scans_compute_network';

export const STEP_CONNECTIVITY_TEST_SCANS_GKE_CLUSTER =
  'build-connectivity-test-scans-gke-cluster';
export const RELATIONSHIP_TYPE_CONNECTIVITY_TEST_SCANS_GKE_CLUSTER =
  'google_cloud_network_analyzer_connectivity_test_scans_gke_cluster';

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
  CONNECTIVITY_TEST_USES_VPC_RELATIONSHIP: 'connectivity-test-uses-vpc',
  CONNECTIVITY_TEST_SCANS_COMPUTE_INSTANCE_RELATIONSHIP:
    'connectivity-test-scans-compute-instance',
  CONNECTIVITY_TEST_SCANS_FORWARDING_RULE_RELATIONSHIP:
    'connectivity-test-scans-compute-forwarding-rule',
  CONNECTIVITY_TEST_SCANS_CLOUD_SQL_INSTANCE_RELATIONSHIP:
    'connectivity-test-cloud-scans-sql-instance',
  CONNECTIVITY_TEST_SCANS_CLOUD_FUNCTION_RELATIONSHIP:
    'connectivity-test-cloud-scans-cloud-function',
  CONNECTIVITY_TEST_SCANS_APP_ENGINE_VERSION_RELATIONSHIP:
    'connectivity-test-cloud-scans-app-engine-version',
  CONNECTIVITY_TEST_SCANS_NETWORK_RELATIONSHIP:
    'connectivity-test-cloud-scans-network',
  CONNECTIVITY_TEST_SCANS_GKE_CLUSTER_RELATIONSHIP:
    'connectivity-test-cloud-scans-gke-cluster',
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
  STEP_NETWORK_ANALYZER_CONNECTIVITY_TEST: [
    'networkmanagement.connectivitytests.list',
  ],
  STEP_NETWORK_INTELLIGENCE_CENTER: [],
  STEP_VPN_GATEWAY: ['compute.vpnGateways.list'],
  STEP_VPN_GATEWAY_TUNNEL: ['compute.vpnTunnels.get'],
};
