export const STEP_CLOUD_RUN_SERVICES = 'fetch-cloud-run-services';
export const STEP_CLOUD_RUN_ROUTES = 'fetch-cloud-run-routes';
export const STEP_CLOUD_RUN_CONFIGURATIONS = 'fetch-cloud-run-configurations';

export const ENTITY_TYPE_CLOUD_RUN_SERVICE = 'google_cloud_run_service';
export const ENTITY_CLASS_CLOUD_RUN_SERVICE = 'Service';

export const ENTITY_TYPE_CLOUD_RUN_ROUTE = 'google_cloud_run_route';
export const ENTITY_CLASS_CLOUD_RUN_ROUTE = 'Configuration';

export const ENTITY_TYPE_CLOUD_RUN_CONFIGURATION =
  'google_cloud_run_configuration';
export const ENTITY_CLASS_CLOUD_RUN_CONFIGURATION = 'Configuration';

export const RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_ROUTE =
  'google_cloud_run_service_manages_route';

export const RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_CONFIGURATION =
  'google_cloud_run_service_manages_configuration';

export const IngestionSources = {
  CLOUD_RUN_SERVICES: 'cloud-run-services',
  CLOUD_RUN_ROUTES: 'cloud-run-routes',
  CLOUD_RUN_CONFIGURATIONS: 'cloud-run-configurations',
};

export const CloudRunIngestionConfig = {
  [IngestionSources.CLOUD_RUN_SERVICES]: {
    title: 'Google Cloud Run Services',
    description: 'Serverless app deployment services.',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_RUN_ROUTES]: {
    title: 'Google Cloud Run Routes',
    description: 'URL paths to Cloud Run services.',
    defaultsToDisabled: false,
  },
  [IngestionSources.CLOUD_RUN_CONFIGURATIONS]: {
    title: 'Google Cloud Run Configurations',
    description: 'Manage configurations of Cloud Run services.',
    defaultsToDisabled: false,
  },
};
