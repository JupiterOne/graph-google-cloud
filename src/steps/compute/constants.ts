// Steps
export const STEP_COMPUTE_INSTANCES = 'fetch-compute-instances';
export const STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS =
  'build-compute-instance-service-account-relationships';
export const STEP_COMPUTE_DISKS = 'fetch-compute-disks';
export const STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS =
  'build-compute-disk-image-relationships';
export const STEP_COMPUTE_DISK_KMS_RELATIONSHIPS =
  'build-compute-disk-kms-relationships';
export const STEP_COMPUTE_REGION_DISKS = 'fetch-compute-region-disks';
export const STEP_COMPUTE_SNAPSHOTS = 'fetch-compute-snapshots';
export const STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS =
  'build-compute-snapshot-disk-relationships';
export const STEP_COMPUTE_IMAGES = 'fetch-compute-images';
export const STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS =
  'build-image-image-relationships';
export const STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS =
  'build-compute-image-kms-relationships';
export const STEP_COMPUTE_NETWORKS = 'fetch-compute-networks';
export const STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS =
  'fetch-compute-networks-peering-relationships';
export const STEP_COMPUTE_ADDRESSES = 'fetch-compute-addresses';
export const STEP_COMPUTE_GLOBAL_ADDRESSES = 'fetch-compute-global-addresses';
export const STEP_COMPUTE_FORWARDING_RULES = 'fetch-compute-forwarding-rules';
export const STEP_COMPUTE_GLOBAL_FORWARDING_RULES =
  'fetch-compute-global-forwarding-rules';
export const STEP_COMPUTE_SUBNETWORKS = 'fetch-compute-subnetworks';
export const STEP_COMPUTE_FIREWALLS = 'fetch-compute-firewalls';
export const STEP_COMPUTE_PROJECT = 'fetch-compute-project';
export const STEP_COMPUTE_HEALTH_CHECKS = 'fetch-compute-health-checks';
export const STEP_COMPUTE_REGION_HEALTH_CHECKS =
  'fetch-compute-region-health-checks';
export const STEP_COMPUTE_INSTANCE_GROUPS = 'fetch-compute-instance-groups';
export const STEP_COMPUTE_REGION_INSTANCE_GROUPS =
  'fetch-compute-region-instance-groups';
export const STEP_COMPUTE_LOADBALANCERS = 'fetch-compute-loadbalancers';
export const STEP_COMPUTE_REGION_LOADBALANCERS =
  'fetch-compute-region-loadbalancers';
export const STEP_COMPUTE_BACKEND_SERVICES = 'fetch-compute-backend-services';
export const STEP_COMPUTE_REGION_BACKEND_SERVICES =
  'fetch-compute-region_backend-services';
export const STEP_COMPUTE_BACKEND_BUCKETS = 'fetch-compute-backend-buckets';
export const STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS =
  'build-compute-backend-bucket-bucket-relationships';
export const STEP_COMPUTE_TARGET_SSL_PROXIES =
  'fetch-compute-target-ssl-proxies';
export const STEP_COMPUTE_TARGET_HTTPS_PROXIES =
  'fetch-compute-target-https-proxies';
export const STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES =
  'fetch-compute-region-target-https-proxies';
export const STEP_COMPUTE_TARGET_HTTP_PROXIES =
  'fetch-compute-target-http-proxies';
export const STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES =
  'fetch-compute-region-target-http-proxies';
export const STEP_COMPUTE_SSL_POLICIES = 'fetch-compute-ssl-policies';
export const STEP_COMPUTE_ROUTER = 'fetch-compute-router';
export const STEP_COMPUTE_NETWORK_ROUTER_RELATIONSHIPS =
  'build-compute-network-router-relationship';

// Entities
export const ENTITY_CLASS_COMPUTE_INSTANCE = ['Host'];
export const ENTITY_TYPE_COMPUTE_INSTANCE = 'google_compute_instance';

export const ENTITY_CLASS_COMPUTE_DISK = ['DataStore', 'Disk'];
export const ENTITY_TYPE_COMPUTE_DISK = 'google_compute_disk';

export const ENTITY_CLASS_COMPUTE_SNAPSHOT = ['Image'];
export const ENTITY_TYPE_COMPUTE_SNAPSHOT = 'google_compute_snapshot';

export const ENTITY_CLASS_COMPUTE_IMAGE = ['Image'];
export const ENTITY_TYPE_COMPUTE_IMAGE = 'google_compute_image';

export const ENTITY_TYPE_COMPUTE_NETWORK = 'google_compute_network';
export const ENTITY_CLASS_COMPUTE_NETWORK = ['Network'];

export const ENTITY_TYPE_COMPUTE_ADDRESS = 'google_compute_address';
export const ENTITY_CLASS_COMPUTE_ADDRESS = ['IpAddress'];

export const ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS =
  'google_compute_global_address';
export const ENTITY_CLASS_COMPUTE_GLOBAL_ADDRESS = ['IpAddress'];

export const ENTITY_TYPE_COMPUTE_FORWARDING_RULE =
  'google_compute_forwarding_rule';
export const ENTITY_CLASS_COMPUTE_FORWARDING_RULE = ['Configuration'];

export const ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE =
  'google_compute_global_forwarding_rule';
export const ENTITY_CLASS_COMPUTE_GLOBAL_FORWARDING_RULE = ['Configuration'];

export const ENTITY_TYPE_COMPUTE_SUBNETWORK = 'google_compute_subnetwork';
export const ENTITY_CLASS_COMPUTE_SUBNETWORK = ['Network'];

export const ENTITY_TYPE_COMPUTE_FIREWALL = 'google_compute_firewall';
export const ENTITY_CLASS_COMPUTE_FIREWALL = ['Firewall'];

export const ENTITY_TYPE_COMPUTE_HEALTH_CHECK = 'google_compute_health_check';
export const ENTITY_CLASS_COMPUTE_HEALTH_CHECK = ['Service'];

export const ENTITY_TYPE_COMPUTE_PROJECT = 'google_compute_project';
export const ENTITY_CLASS_COMPUTE_PROJECT = ['Project'];

export const ENTITY_TYPE_COMPUTE_INSTANCE_GROUP =
  'google_compute_instance_group';
export const ENTITY_CLASS_COMPUTE_INSTANCE_GROUP = ['Group'];

export const ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT =
  'google_compute_instance_group_named_port';
export const ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT = ['Configuration'];

export const ENTITY_TYPE_COMPUTE_LOAD_BALANCER = 'google_compute_url_map';
export const ENTITY_CLASS_COMPUTE_LOAD_BALANCER = ['Gateway'];

export const ENTITY_TYPE_COMPUTE_BACKEND_SERVICE =
  'google_compute_backend_service';
export const ENTITY_CLASS_COMPUTE_BACKEND_SERVICE = ['Service'];

export const ENTITY_TYPE_COMPUTE_BACKEND_BUCKET =
  'google_compute_backend_bucket';
export const ENTITY_CLASS_COMPUTE_BACKEND_BUCKET = ['Gateway'];

export const ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY =
  'google_compute_target_ssl_proxy';
export const ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY = ['Gateway'];

export const ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY =
  'google_compute_target_http_proxy';
export const ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY = ['Gateway'];

export const ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY =
  'google_compute_target_https_proxy';
export const ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY = ['Gateway'];

export const ENTITY_TYPE_COMPUTE_SSL_POLICY = 'google_compute_ssl_policy';
export const ENTITY_CLASS_COMPUTE_SSL_POLICY = 'Policy';

export const ENTITY_TYPE_COMPUTE_ROUTER = 'google_cloud_compute_router';
export const ENTITY_CLASS_COMPUTE_ROUTER = ['Device'];

// Relationships
export const RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT =
  'google_compute_instance_trusts_iam_service_account';
export const RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK =
  'google_compute_instance_uses_disk';
export const RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK =
  'google_compute_network_contains_subnetwork';
export const RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK =
  'google_compute_network_connects_network';
export const RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE =
  'google_compute_subnetwork_has_instance';
export const RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_ADDRESS =
  'google_compute_subnetwork_has_address';
export const RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS =
  'google_compute_subnetwork_has_global_address';
export const RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ADDRESS =
  'google_compute_network_has_address';
export const RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS =
  'google_compute_network_has_global_address';
export const RELATIONSHIP_TYPE_COMPUTE_INSTANCE_USES_ADDRESS =
  'google_compute_instance_uses_address';
export const RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK =
  'google_compute_firewall_protects_network';
export const RELATIONSHIP_TYPE_DISK_USES_IMAGE =
  'google_compute_disk_uses_image';
export const RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY =
  'google_compute_disk_uses_kms_crypto_key';
export const RELATIONSHIP_TYPE_DISK_CREATED_SNAPSHOT =
  'google_compute_disk_created_snapshot';
export const RELATIONSHIP_TYPE_IMAGE_CREATED_IMAGE =
  'google_compute_image_created_image';
export const RELATIONSHIP_TYPE_SNAPSHOT_CREATED_IMAGE =
  'google_compute_snapshot_created_image';
export const RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY =
  'google_compute_image_uses_kms_crypto_key';
export const RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL =
  'google_compute_network_has_firewall';
export const RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE =
  'google_compute_project_has_instance';
export const RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_COMPUTE_INSTANCE =
  'google_compute_instance_group_has_instance';
export const RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT =
  'google_compute_instance_group_has_named_port';
export const RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP =
  'google_compute_backend_service_has_instance_group';
export const RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK =
  'google_compute_backend_service_has_health_check';
export const RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE =
  'google_compute_url_map_has_backend_service';
export const RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_BUCKET =
  'google_compute_url_map_has_backend_bucket';
export const RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET =
  'google_compute_backend_bucket_has_storage_bucket';

export const RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE =
  'google_compute_forwarding_rule_connects_backend_service';
export const RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK =
  'google_compute_forwarding_rule_connects_subnetwork';
export const RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK =
  'google_compute_forwarding_rule_connects_network';
export const RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY =
  'google_compute_forwarding_rule_connects_target_http_proxy';
export const RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY =
  'google_compute_forwarding_rule_connects_target_https_proxy';

export const RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE =
  'google_compute_global_forwarding_rule_connects_backend_service';

export const RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK =
  'google_compute_global_forwarding_rule_connects_subnetwork';

export const RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK =
  'google_compute_global_forwarding_rule_connects_network';

export const RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY =
  'google_compute_global_forwarding_rule_connects_target_http_proxy';

export const RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY =
  'google_compute_global_forwarding_rule_connects_target_https_proxy';

export const RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_USES_ADDRESS =
  'google_compute_forwarding_rule_uses_address';

export const RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY =
  'google_compute_url_map_has_target_https_proxy';
export const RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY =
  'google_compute_url_map_has_target_http_proxy';
export const RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_TARGET_SSL_PROXY =
  'google_compute_backend_service_has_target_ssl_proxy';
export const RELATIONSHIP_TYPE_TARGET_HTTPS_PROXY_HAS_SSL_POLICY =
  'google_compute_target_https_proxy_has_ssl_policy';
export const RELATIONSHIP_TYPE_TARGET_SSL_PROXY_HAS_SSL_POLICY =
  'google_compute_target_ssl_proxy_has_ssl_policy';
export const RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ROUTER =
  'google_compute_network_has_cloud_compute_router';

// Mapped relationships
export const MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE =
  'google_cloud_firewall_rule';

export const IngestionSources = {
  COMPUTE_NETWORKS: 'compute-networks',
  COMPUTE_ADDRESSES: 'compute-addresses',
  COMPUTE_GLOBAL_ADDRESSES: 'compute-global-addresses',
  COMPUTE_FORWARDING_RULES: 'compute-forwarding-rules',
  COMPUTE_GLOBAL_FORWARDING_RULES: 'compute-global-forwarding-rules',
  COMPUTE_FIREWALLS: 'compute-firewalls',
  COMPUTE_SUBNETWORKS: 'compute-subnetworks',
  COMPUTE_DISKS: 'compute-disks',
  COMPUTE_REGION_DISKS: 'compute-region-disks',
  COMPUTE_SNAPSHOTS: 'compute-snapshots',
  COMPUTE_IMAGES: 'compute-images',
  COMPUTE_INSTANCES: 'compute-instances',
  COMPUTE_PROJECT: 'compute-project',
  COMPUTE_HEALTH_CHECKS: 'compute-health-checks',
  COMPUTE_REGION_HEALTH_CHECKS: 'compute-region-health-checks',
  COMPUTE_REGION_INSTANCE_GROUPS: 'compute-region-instance-groups',
  COMPUTE_INSTANCE_GROUPS: 'compute-instance-groups',
  COMPUTE_LOADBALANCERS: 'compute-loadbalancers',
  COMPUTE_REGION_LOADBALANCERS: 'compute-region-loadbalancers',
  COMPUTE_BACKEND_SERVICES: 'compute-backend-services',
  COMPUTE_REGION_BACKEND_SERVICES: 'compute-region-backend-services',
  COMPUTE_BACKEND_BUCKETS: 'compute-backend-buckets',
  COMPUTE_TARGET_SSL_PROXIES: 'compute-target-ssl-proxies',
  COMPUTE_TARGET_HTTPS_PROXIES: 'compute-target-https-proxies',
  COMPUTE_REGION_TARGET_HTTPS_PROXIES: 'compute-region-target-https-proxies',
  COMPUTE_TARGET_HTTP_PROXIES: 'compute-target-http-proxies',
  COMPUTE_REGION_TARGET_HTTP_PROXIES: 'compute-region-target-http-proxies',
  COMPUTE_SSL_POLICIES: 'compute-ssl-policies',
  COMPUTE_ROUTER: 'compute-router',
};

export const ComputeIngestionConfig = {
  [IngestionSources.COMPUTE_NETWORKS]: {
    title: 'Google Compute Engine Networks',
    description: 'Virtual networks for GCP resources.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_ADDRESSES]: {
    title: 'Google Compute Engine Addresses',
    description: 'Static IP addresses for compute instances.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_GLOBAL_ADDRESSES]: {
    title: 'Google Compute Global Addresses',
    description: 'Global static IP addresses.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_FORWARDING_RULES]: {
    title: 'Google Compute Forwarding Rules',
    description: 'Rules for routing network traffic.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_GLOBAL_FORWARDING_RULES]: {
    title: 'Google Compute Global Forwarding Rules',
    description: 'Global traffic routing rules.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_FIREWALLS]: {
    title: 'Google Compute Firewalls',
    description: 'Firewall rules for network security.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_SUBNETWORKS]: {
    title: 'Google Compute Subnetworks',
    description: 'Subsections of Compute Engine networks.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_DISKS]: {
    title: 'Google Compute Engine Disks',
    description: 'Persistent disks for VM instances.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_REGION_DISKS]: {
    title: 'Google Compute Region Disks',
    description: 'Regional persistent disks.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_SNAPSHOTS]: {
    title: 'Google Compute Engine Snapshots',
    description: 'Snapshots for backing up disks.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_IMAGES]: {
    title: 'Google Compute Engine Images',
    description: 'Custom OS images for VMs.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_INSTANCES]: {
    title: 'Google Compute Engine Instances',
    description: 'Virtual machine instances in GCP.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_PROJECT]: {
    title: 'Google Compute Engine Project',
    description: 'Project-wide compute settings.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_HEALTH_CHECKS]: {
    title: 'Google Compute Health Checks',
    description: 'Monitoring for compute instance health.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_REGION_HEALTH_CHECKS]: {
    title: 'Google Compute Regional Health Checks',
    description: 'Regional health monitoring checks.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_INSTANCE_GROUPS]: {
    title: 'Google Compute Instance Groups',
    description: 'VM instance groups.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_REGION_INSTANCE_GROUPS]: {
    title: 'Google Compute Region Instance Groups',
    description: 'Regional VM instance groups.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_LOADBALANCERS]: {
    title: 'Google Compute Load Balancers',
    description: 'Distribute network or application traffic.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_REGION_LOADBALANCERS]: {
    title: 'Google Compute Regional Load Balancers',
    description: 'Regional load balancing solutions.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_BACKEND_SERVICES]: {
    title: 'Google Compute Backend Services',
    description: 'Backend services for load balancing.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_REGION_BACKEND_SERVICES]: {
    title: 'Google Compute Regional Backend Services',
    description: 'Regional backend services for traffic mgmt.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_BACKEND_BUCKETS]: {
    title: 'Google Compute Backend Buckets',
    description: 'Buckets as backends for load balancing.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_TARGET_SSL_PROXIES]: {
    title: 'Google Compute Target SSL Proxies',
    description: 'SSL proxies for secure network traffic.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_TARGET_HTTPS_PROXIES]: {
    title: 'Google Compute Target HTTPS Proxies',
    description: 'HTTPS proxy layers for secure traffic.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_REGION_TARGET_HTTPS_PROXIES]: {
    title: 'Google Compute Regional Target HTTPS Proxies',
    description: 'Regional HTTPS proxies for traffic mgmt.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_TARGET_HTTP_PROXIES]: {
    title: 'Google Compute Target HTTP Proxies',
    description: 'HTTP proxies for network traffic mgmt.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_REGION_TARGET_HTTP_PROXIES]: {
    title: 'Google Compute Regional Target HTTP Proxies',
    description: 'Regional HTTP proxies for load balancing.',
    defaultsToDisabled: false,
  },
  [IngestionSources.COMPUTE_SSL_POLICIES]: {
    title: 'Google Compute SSL Policies',
    description: 'SSL policies for secure network connections.',
    defaultsToDisabled: false,
  },
};

export const ComputePermissions = {
  STEP_COMPUTE_NETWORKS: ['compute.networks.list'],
  STEP_COMPUTE_SUBNETWORKS: ['compute.subnetworks.list'],
  STEP_COMPUTE_DISKS: ['compute.disks.list'],
  STEP_COMPUTE_REGION_DISKS: ['compute.disks.list'],
  STEP_COMPUTE_BACKEND_BUCKETS: ['compute.backendBuckets.list'],
  STEP_COMPUTE_SNAPSHOTS: ['compute.snapshots.list'],
  STEP_COMPUTE_HEALTH_CHECKS: ['compute.healthChecks.list'],
  STEP_COMPUTE_REGION_HEALTH_CHECKS: ['compute.regionHealthChecks.list'],
  STEP_COMPUTE_INSTANCE_GROUPS: ['compute.instanceGroups.list'],
  STEP_COMPUTE_REGION_INSTANCE_GROUPS: ['compute.instanceGroups.list'],
  STEP_COMPUTE_PROJECT: ['compute.projects.get'],
  STEP_COMPUTE_ADDRESSES: ['compute.addresses.list'],
  STEP_COMPUTE_REGION_BACKEND_SERVICES: ['compute.regionBackendServices.list'],
  STEP_COMPUTE_BACKEND_SERVICES: ['compute.backendServices.list'],
  STEP_COMPUTE_GLOBAL_ADDRESSES: ['compute.globalAddresses.list'],
  STEP_COMPUTE_REGION_LOADBALANCERS: ['compute.regionUrlMaps.list'],
  STEP_COMPUTE_TARGET_HTTPS_PROXIES: ['compute.targetHttpsProxies.list'],
  STEP_COMPUTE_INSTANCES: [
    'compute.instances.list',
    'osconfig.inventories.get',
  ],
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES: [
    'compute.regionTargetHttpsProxies.list',
  ],
  STEP_COMPUTE_FIREWALLS: ['compute.firewalls.list'],
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES: [
    'compute.regionTargetHttpProxies.list',
  ],
  STEP_COMPUTE_TARGET_HTTP_PROXIES: ['compute.targetHttpProxies.list'],
  STEP_COMPUTE_SSL_POLICIES: ['compute.sslPolicies.list'],
  STEP_COMPUTE_FORWARDING_RULES: ['compute.forwardingRules.list'],
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES: ['compute.globalForwardingRules.list'],
  STEP_COMPUTE_LOADBALANCERS: ['compute.urlMaps.list'],
  STEP_COMPUTE_TARGET_SSL_PROXIES: ['compute.targetSslProxies.list'],
  STEP_COMPUTE_IMAGES: ['compute.images.list', 'compute.images.getIamPolicy'],
  STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS: ['compute.images.get'],
  STEP_COMPUTE_ROUTER: ['compute.routers.list'],
};
