export const STEP_BEYONDCORP_APP_CONNECTOR = 'fetch-beyondcorp-app-connector';
export const BEYONDCORP_APP_CONNECTOR_CLASS = ['Network'];
export const BEYONDCORP_APP_CONNECTOR_TYPE =
  'google_cloud_beyondcorp_connector';

export const STEP_BEYONDCORP_GATEWAY = 'fetch-beyondcorp-gateway';
export const BEYONDCORP_GATEWAY_CLASS = ['Gateway'];
export const BEYONDCORP_GATEWAY_TYPE = 'google_cloud_beyondcorp_gateway';

export const STEP_BEYONDCORP_APPLICATION_ENDPOINT =
  'fetch-beyondcorp-application-endpoint';
export const BEYONDCORP_APPLICATION_ENPOINT_CLASS = ['NetworkEndpoint'];
export const BEYONDCORP_APPLICATION_ENDPOINT_TYPE =
  'google_cloud_beyondcorp_application_endpoint';

export const STEP_BEYONDCORP_APP_CONNECTION = 'fetch-beyondcorp-app-connection';
export const BEYONDCORP_APP_CONNECTION_CLASS = ['Network'];
export const BEYONDCORP_APP_CONNECTION_TYPE =
  'google_cloud_beyondcorp_connection';

export const STEP_BEYONDCORP_PARTNER_TENANT = 'fetch-beyondcorp-partner-tenant';
export const BEYONDCORP_ENTERPRISE_PARTNER_TENANT_TYPE =
  'google_cloud_beyondborp_partner_tenant';
export const BEYONDCORP_ENTERPRISE_PARTNER_TENANT_CLASS = ['Organization'];

export const STEP_BEYONDCORP_ENTERPRISE = 'fetch-beyondcorp-enterprise';
export const BEYONDCORP_ENTERPRISE_TYPE = 'google_cloud_beyondcorp_enterprise';
export const BEYONDCORP_ENTERPRISE_CLASS = ['Service'];

export const RELATIONSHIP_TYPE_APPLICATION_ENDPOINT_USES_GATEWAY =
  'google_cloud_beyondcorp_application_endpoint_uses_gateway';
export const STEP_APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP =
  'fetch-application-endpoint-uses-gateway';

export const RELATIONSHIP_TYPE_APP_CONNECTION_HAS_APP_CONNECTOR =
  'google_cloud_beyondcorp_connection_has_connector';
export const STEP_APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP =
  'fetch-app-connection-has-app-connector';

export const RELATIONSHIP_TYPE_APP_CONNECTION_HAS_APPLICATION_ENDPOINT =
  'google_cloud_beyondcorp_connection_has_application_endpoint';
export const STEP_APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP =
  'fetch-app-connection-has-applifcation-endpoint';

export const RELATIONSHIP_TYPE_APP_CONNECTION_HAS_GATEWAY =
  'google_cloud_beyondcorp_connection_has_gateway';
export const STEP_APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP =
  'fetch-app-connection-has-gateway';

export const RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTOR =
  'google_cloud_project_uses_beyondcorp_connector';
export const STEP_PROJECT_USES_APP_CONNECTOR_RELATIONSHIP =
  'fetch-project-uses-app-connector';

export const RELATIONSHIP_TYPE_PROJECT_USES_APP_CONNECTION =
  'google_cloud_project_uses_beyondcorp_connection';
export const STEP_PROJECT_USES_APP_CONNECTION_RELATIONSHIP =
  'fetch-project-uses-app-connection';

export const RELATIONSHIP_TYPE_PROJECT_HAS_BEYONDCORP_ENTERPRISE =
  'google_cloud_project_has_beyondcorp_enterprise';
export const STEP_PROJECT_HAS_BEYONDCORP_ENTERPRISE_RELATIONSHIP =
  'fetch-project-has-beyondcorp-enterprise';

export const IngestionSources = {
  BEYONDCORP_CONNECTORS: 'beyondcorp_connectors',
  BEYONDCORP_GATEWAYS: 'beyondcorp_gateways',
  BEYONDCORP_CONNECTIONS: 'beyondcorp_connections',
  BEYONDCORP_APPLICATION_ENDPOINTS: 'beyondcorp_application_endpoints',
  BEYONDCORP_PARTNER_TENANT: 'beyondcorp_partner_tenant',
  BEYONDCORP_ENTERPRISE: 'beyondcorp_enterprise',
  APP_CONNECTION_HAS_APP_CONNECTOR_RELATIONSHIP:
    'app_connection_has_app_connector',
  APP_CONNECTION_HAS_APPLICATION_ENDPOINT_RELATIONSHIP:
    'app_connection_has_application_endpoint',
  APP_CONNECTION_HAS_GATEWAY_RELATIONSHIP: 'app_connection_has_gateway',
  PROJECT_USES_APP_CONNECTOR_RELATIONSHIP: 'project_uses_app_connector',
  PROJECT_USES_APP_CONNECTION_RELATIONSHIP: 'project_uses_app_connection',
  APPLICATION_ENDPOINT_USES_GATEWAY_RELATIONSHIP:
    'application_endpoint_uses_gateway',
  PROJECT_HAS_BEYONDCORP_ENTERPRISE: 'project_has_beyondcorp_enterprise',
};

export const MonitoringIngestionConfig = {
  [IngestionSources.BEYONDCORP_CONNECTORS]: {
    title: 'BeyondCorp App Connector',
    description: 'BeyondCorp App Connectors for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.BEYONDCORP_GATEWAYS]: {
    title: 'BeyondCorp Gateways',
    description: 'BeyondCorp Gateways for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.BEYONDCORP_ENTERPRISE]: {
    title: 'BeyondCorp Enterprise',
    description: 'BeyondCorp Enterprise for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.BEYONDCORP_APPLICATION_ENDPOINTS]: {
    title: 'BeyondCorp Application endpoints',
    description: 'BeyondCorp Application endpoints for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.BEYONDCORP_CONNECTIONS]: {
    title: 'BeyondCorp App Connections',
    description: 'BeyondCorp App Connection for GCP',
    defaultsToDisabled: false,
  },
  [IngestionSources.BEYONDCORP_PARTNER_TENANT]: {
    title: 'BeyondCorp Partner Tenant',
    description: 'BeyondCorp Partner Tenant for GCP',
    defaultsToDisabled: false,
  },
};
