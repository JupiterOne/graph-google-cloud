export const STEP_SPANNER_INSTANCES = 'fetch-spanner-instances';
export const STEP_SPANNER_INSTANCE_DATABASES =
  'fetch-spanner-instance-databases';
export const STEP_SPANNER_INSTANCE_CONFIGS = 'fetch-spanner-instance-configs';

export const ENTITY_CLASS_SPANNER_INSTANCE_CONFIG = 'Configuration';
export const ENTITY_TYPE_SPANNER_INSTANCE_CONFIG =
  'google_spanner_instance_config';

export const ENTITY_CLASS_SPANNER_INSTANCE = ['Database', 'Cluster'];
export const ENTITY_TYPE_SPANNER_INSTANCE = 'google_spanner_instance';

export const ENTITY_CLASS_SPANNER_INSTANCE_DATABASE = 'Database';
export const ENTITY_TYPE_SPANNER_INSTANCE_DATABASE = 'google_spanner_database';

export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_DATABASE =
  'google_spanner_instance_has_database';
export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_USES_CONFIG =
  'google_spanner_instance_uses_config';
export const RELATIONSHIP_TYPE_SPANNER_INSTANCE_DATABASE_USES_KMS_KEY =
  'google_spanner_database_uses_kms_crypto_key';
