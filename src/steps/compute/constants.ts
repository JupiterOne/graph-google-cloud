// Steps
export const STEP_COMPUTE_INSTANCES = 'fetch-compute-instances';
export const STEP_COMPUTE_DISKS = 'fetch-compute-disks';
export const STEP_COMPUTE_NETWORKS = 'fetch-compute-networks';
export const STEP_COMPUTE_SUBNETWORKS = 'fetch-compute-subnetworks';
export const STEP_COMPUTE_FIREWALLS = 'fetch-compute-firewalls';

// Entities
export const ENTITY_CLASS_COMPUTE_DISK = ['DataStore', 'Disk'];
export const ENTITY_TYPE_COMPUTE_DISK = 'google_compute_disk';
export const ENTITY_CLASS_COMPUTE_INSTANCE = 'Host';
export const ENTITY_TYPE_COMPUTE_INSTANCE = 'google_compute_instance';

export const ENTITY_TYPE_COMPUTE_FIREWALL = 'google_compute_firewall';
export const ENTITY_CLASS_COMPUTE_FIREWALL = 'Firewall';
export const ENTITY_TYPE_COMPUTE_SUBNETWORK = 'google_compute_subnetwork';
export const ENTITY_CLASS_COMPUTE_SUBNETWORK = 'Network';
export const ENTITY_TYPE_COMPUTE_NETWORK = 'google_compute_network';
export const ENTITY_CLASS_COMPUTE_NETWORK = 'Network';

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
export const RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL =
  'google_compute_network_has_firewall';

// Mapped relationships
export const MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE =
  'google_cloud_firewall_rule';
