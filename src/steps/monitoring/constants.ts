export const STEP_MONITORING_ALERT_POLICIES = 'fetch-monitoring-alert-policies';

export const MONITORING_ALERT_POLICY_CLASS = 'Policy';
export const MONITORING_ALERT_POLICY_TYPE = 'google_monitoring_alert_policy';

export const IngestionSources = {
  MONITORING_ALERT_POLICIES: 'monitoring-alert-policies',
};

export const MonitoringIngestionConfig = {
  [IngestionSources.MONITORING_ALERT_POLICIES]: {
    title: 'Google Monitoring Alert Policies',
    description: 'Alert policies for GCP resources.',
    defaultsToDisabled: false,
  },
};
