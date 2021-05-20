// Steps
export const STEP_COMPUTE_INSTANCES = 'fetch-compute-instances';
export const STEP_COMPUTE_DISKS = 'fetch-compute-disks';
export const STEP_COMPUTE_IMAGES = 'fetch-compute-images';
export const STEP_COMPUTE_NETWORKS = 'fetch-compute-networks';
export const STEP_COMPUTE_SUBNETWORKS = 'fetch-compute-subnetworks';
export const STEP_COMPUTE_FIREWALLS = 'fetch-compute-firewalls';
export const STEP_COMPUTE_PROJECT = 'fetch-compute-project';
export const STEP_COMPUTE_HEALTH_CHECKS = 'fetch-compute-health-checks';
export const STEP_COMPUTE_INSTANCE_GROUPS = 'fetch-compute-instance-groups';
export const STEP_COMPUTE_LOADBALANCERS = 'fetch-compute-loadbalancers';
export const STEP_COMPUTE_BACKEND_SERVICES = 'fetch-compute-backend-services';
export const STEP_COMPUTE_BACKEND_BUCKETS = 'fetch-compute-backend-buckets';
export const STEP_COMPUTE_TARGET_SSL_PROXIES =
  'fetch-compute-target-ssl-proxies';
export const STEP_COMPUTE_TARGET_HTTPS_PROXIES =
  'fetch-compute-target-https-proxies';
export const STEP_COMPUTE_TARGET_HTTP_PROXIES =
  'fetch-compute-target-http-proxies';
export const STEP_COMPUTE_SSL_POLICIES = 'fetch-compute-ssl-policies';

// Entities
export const ENTITY_CLASS_COMPUTE_INSTANCE = 'Host';
export const ENTITY_TYPE_COMPUTE_INSTANCE = 'google_compute_instance';

export const ENTITY_CLASS_COMPUTE_DISK = ['DataStore', 'Disk'];
export const ENTITY_TYPE_COMPUTE_DISK = 'google_compute_disk';

export const ENTITY_CLASS_COMPUTE_IMAGE = 'Image';
export const ENTITY_TYPE_COMPUTE_IMAGE = 'google_compute_image';

export const ENTITY_TYPE_COMPUTE_NETWORK = 'google_compute_network';
export const ENTITY_CLASS_COMPUTE_NETWORK = 'Network';

export const ENTITY_TYPE_COMPUTE_SUBNETWORK = 'google_compute_subnetwork';
export const ENTITY_CLASS_COMPUTE_SUBNETWORK = 'Network';

export const ENTITY_TYPE_COMPUTE_FIREWALL = 'google_compute_firewall';
export const ENTITY_CLASS_COMPUTE_FIREWALL = 'Firewall';

export const ENTITY_TYPE_COMPUTE_HEALTH_CHECK = 'google_compute_health_check';
export const ENTITY_CLASS_COMPUTE_HEALTH_CHECK = 'Service';

export const ENTITY_TYPE_COMPUTE_PROJECT = 'google_compute_project';
export const ENTITY_CLASS_COMPUTE_PROJECT = 'Project';

export const ENTITY_TYPE_COMPUTE_INSTANCE_GROUP =
  'google_compute_instance_group';
export const ENTITY_CLASS_COMPUTE_INSTANCE_GROUP = 'Group';

export const ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT =
  'google_compute_instance_group_named_port';
export const ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT = 'Configuration';

export const ENTITY_TYPE_COMPUTE_LOAD_BALANCER = 'google_compute_url_map';
export const ENTITY_CLASS_COMPUTE_LOAD_BALANCER = 'Gateway';

export const ENTITY_TYPE_COMPUTE_BACKEND_SERVICE =
  'google_compute_backend_service';
export const ENTITY_CLASS_COMPUTE_BACKEND_SERVICE = 'Service';

export const ENTITY_TYPE_COMPUTE_BACKEND_BUCKET =
  'google_compute_backend_bucket';
export const ENTITY_CLASS_COMPUTE_BACKEND_BUCKET = 'Gateway';

export const ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY =
  'google_compute_target_ssl_proxy';
export const ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY = 'Gateway';

export const ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY =
  'google_compute_target_http_proxy';
export const ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY = 'Gateway';

export const ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY =
  'google_compute_target_https_proxy';
export const ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY = 'Gateway';

export const ENTITY_TYPE_COMPUTE_SSL_POLICY = 'google_compute_ssl_policy';
export const ENTITY_CLASS_COMPUTE_SSL_POLICY = 'Policy';

// Relationships
export const RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT =
  'google_compute_instance_trusts_iam_service_account';
export const RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK =
  'google_compute_instance_uses_disk';
export const RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK =
  'google_compute_network_contains_subnetwork';
export const RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE =
  'google_compute_subnetwork_has_instance';
export const RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK =
  'google_compute_firewall_protects_network';
export const RELATIONSHIP_TYPE_DISK_USES_IMAGE =
  'google_compute_disk_uses_image';
export const RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY =
  'google_compute_disk_uses_kms_crypto_key';
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

// Mapped relationships
export const MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE =
  'google_cloud_firewall_rule';
