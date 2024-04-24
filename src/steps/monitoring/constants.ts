export const STEP_MONITORING_ALERT_POLICIES = 'fetch-monitoring-alert-policies';

export const MONITORING_ALERT_POLICY_CLASS = 'Policy';
export const MONITORING_ALERT_POLICY_TYPE = 'google_monitoring_alert_policy';

export const STEP_MONITORING_GROUPS = 'fetch-monitoring-groups';
export const MONITORING_GROUP_CLASS = ['Group'];
export const MONITORING_GROUP_TYPE = 'google_cloud_group';

export const STEP_MONITORING_CHANNELS = 'fetch-monitoring-channels';
export const MONITORING_CHANNEL_CLASS = ['Channel'];
export const MONITORING_CHANNEL_TYPE = 'google_cloud_monitoring-channel';

export const STEP_CLOUD_MONITORING = 'fetch-cloud-monitoring';
export const CLOUD_MONITORING_CLASS = ['Service'];
export const CLOUD_MONITORING_TYPE = 'google_cloud_monitoring';

export const STEP_PROJECT_HAS_CLOUD_MONITORING_RELATIONSHIP =
  'fetch-project-has-cloud-monitoring';
export const RELATIONSHIP_PROJECT_HAS_CLOUD_MONITORING_TYPE =
  'google_cloud_project_has_monitoring';

export const STEP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_RELATIONSHIP =
  'fetch-cloud-monitoring-has-monitoring-groups';
export const RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_GROUPS_TYPE =
  'google_cloud_monitoring_has_group';

export const STEP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_RELATIONSHIP =
  'fetch-cloud-monitoring-has-monitoring-channels';
export const REALTIONSHIP_CLOUD_MONITORING_HAS_MONITORING_CHANNELS_TYPE =
  'google_cloud_monitoring_has_monitoring-channel';

export const STEP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_RELATIONSHIP =
  'fetch-cloud-monitoring-has-monitoring-alert-policies';
export const RELATIONSHIP_CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES_TYPE =
  'google_cloud_monitoring_has_monitoring_alert_policy';

export const IngestionSources = {
  MONITORING_ALERT_POLICIES: 'monitoring-alert-policies',
  MONITORING_GROUP: 'monitoring-groups',
  MONITORING_CHANNEL: 'monitoring-channels',
  CLOUD_MONITORING: 'cloud-monitoring',
  PROJECT_HAS_CLOUD_MONITORING: 'project-has-cloud-monitoring',
  CLOUD_MONITORING_HAS_MONITORING_GROUPS:
    'cloud-monitoring-has-monitoring-groups',
  CLOUD_MONITORING_HAS_MONITORING_CHANNELS:
    'cloud-monitoring-has-monitoring-channels',
  CLOUD_MONITORING_HAS_MONITORING_ALERT_POLICIES:
    'cloud-monitoring-has-monitoring-alert-policies',
};

export const MonitoringIngestionConfig = {
  [IngestionSources.MONITORING_ALERT_POLICIES]: {
    title: 'Google Monitoring Alert Policies',
    description: 'Alert policies for GCP resources.',
    defaultsToDisabled: false,
  },
  [IngestionSources.MONITORING_GROUP]: {
    title: 'Google Monitoring Group',
    description: 'Group for GCP resources. ',
    defaultsToDisabled: false,
  },
  [IngestionSources.MONITORING_CHANNEL]: {
    title: 'Google Monitoring Channel',
    description: 'Notification Channels for GCP resource',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_MONITORING]: {
    title: ' Cloud monitoring',
    description: 'Cloud Monitoring for GCP resource',
    defaultsToDisabled: false,
  },
};
