export const STEP_BIG_QUERY_DATASETS = 'fetch-big-query-datasets';
export const STEP_BIG_QUERY_TABLES = 'fetch-big-query-tables';
export const STEP_BIG_QUERY_MODELS = 'fetch-big-query-models';
export const STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS =
  'build-big-query-dataset-kms-relationships';

export const BIG_QUERY_DATASET_ENTITY_CLASS = ['DataStore', 'Database'];
export const BIG_QUERY_DATASET_ENTITY_TYPE = 'google_bigquery_dataset';

export const BIG_QUERY_TABLE_ENTITY_CLASS = 'DataCollection';
export const BIG_QUERY_TABLE_ENTITY_TYPE = 'google_bigquery_table';

export const BIG_QUERY_MODEL_ENTITY_CLASS = 'Model';
export const BIG_QUERY_MODEL_ENTITY_TYPE = 'google_bigquery_model';

export const RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY =
  'google_bigquery_dataset_uses_kms_crypto_key';
export const RELATIONSHIP_TYPE_DATASET_HAS_TABLE =
  'google_bigquery_dataset_has_table';
export const RELATIONSHIP_TYPE_DATASET_HAS_MODEL =
  'google_bigquery_dataset_has_model';

export const IngestionSources = {
  BIG_QUERY_DATASETS: 'big-query-datasets',
  BIG_QUERY_MODELS: 'big-query-models',
  BIG_QUERY_TABLES: 'big-query-tables',
};

export const BigQueryIngestionConfig = {
  [IngestionSources.BIG_QUERY_DATASETS]: {
    title: 'Google Cloud BigQuery Datasets',
    description: 'Organized collections of BigQuery data.',
    defaultsToDisabled: true,
  },
  [IngestionSources.BIG_QUERY_MODELS]: {
    title: 'Google Cloud BigQuery Models',
    description: 'Machine learning models in BigQuery.',
    defaultsToDisabled: true,
  },
  [IngestionSources.BIG_QUERY_TABLES]: {
    title: 'Google Cloud BigQuery Tables',
    description: 'Structured data tables in BigQuery.',
    defaultsToDisabled: true,
  },
};
