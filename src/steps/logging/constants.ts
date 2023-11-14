export const STEP_LOGGING_PROJECT_SINKS = 'fetch-logging-project-sinks';
export const STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS =
  'build-logging-project-sink-bucket-relationships';
export const STEP_LOGGING_METRICS = 'fetch-logging-metrics';

export const LOGGING_PROJECT_SINK_ENTITY_TYPE = 'google_logging_project_sink';
export const LOGGING_PROJECT_SINK_ENTITY_CLASS = 'Logs';

export const LOGGING_METRIC_ENTITY_TYPE = 'google_logging_metric';
export const LOGGING_METRIC_ENTITY_CLASS = 'Configuration';

export const RELATIONSHIP_TYPE_PROJECT_SINK_USES_STORAGE_BUCKET =
  'google_logging_project_sink_uses_storage_bucket';

export const RELATIONSHIP_TYPE_METRIC_HAS_ALERT_POLICY =
  'google_logging_metric_has_monitoring_alert_policy';

export const IngestionSources = {
  LOGGING_PROJECT_SINKS: 'logging-project-sinks',
  LOGGING_METRICS: 'logging-metrics',
};

export const LoggingIngestionConfig = {
  [IngestionSources.LOGGING_PROJECT_SINKS]: {
    title: 'Google Logging Project Sinks',
    description: 'Destinations for log entries export.',
    defaultsToDisabled: true,
  },
  [IngestionSources.LOGGING_METRICS]: {
    title: 'Google Logging Metrics',
    description: 'Custom metrics from log data.',
    defaultsToDisabled: true,
  },
};
