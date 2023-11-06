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

export const IngestionSources = {
  SPANNER_INSTANCE_CONFIGS: 'spanner-instance-configs',
  SPANNER_INSTANCES: 'spanner-instances',
  SPANNER_INSTANCE_DATABASES: 'spanner-instance-databases',
};

export const SpannerIngestionConfig = {
  [IngestionSources.SPANNER_INSTANCE_CONFIGS]: {
    title: 'Google Spanner Instance Configs',
    description: 'Configurations for Spanner instances.',
    defaultsToDisabled: false,
  },
  [IngestionSources.SPANNER_INSTANCES]: {
    title: 'Google Spanner Instances',
    description: 'Managed database instances in Spanner.',
    defaultsToDisabled: false,
  },
  [IngestionSources.SPANNER_INSTANCE_DATABASES]: {
    title: 'Google Spanner Databases',
    description: 'Databases within Spanner instances.',
    defaultsToDisabled: false,
  },
};
