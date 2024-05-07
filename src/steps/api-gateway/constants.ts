export const STEP_API_GATEWAY_APIS = 'fetch-api-gateway-apis';
export const STEP_API_GATEWAY_API_CONFIGS = 'fetch-api-gateway-api-configs';
export const STEP_API_GATEWAY_GATEWAYS = 'fetch-api-gateway-gateways';

export const ENTITY_CLASS_API_GATEWAY_API = 'Service';
export const ENTITY_TYPE_API_GATEWAY_API = 'google_api_gateway_api';

export const ENTITY_CLASS_API_GATEWAY_API_CONFIG = 'Configuration';
export const ENTITY_TYPE_API_GATEWAY_API_CONFIG =
  'google_api_gateway_api_config';

export const ENTITY_CLASS_API_GATEWAY_GATEWAY = 'Gateway';
export const ENTITY_TYPE_API_GATEWAY_GATEWAY = 'google_api_gateway_gateway';

export const RELATIONSHIP_TYPE_API_GATEWAY_API_USES_CONFIG =
  'google_api_gateway_api_uses_config';
export const RELATIONSHIP_TYPE_API_GATEWAY_API_HAS_GATEWAY =
  'google_api_gateway_api_has_gateway';
export const RELATIONSHIP_TYPE_API_GATEWAY_API_CONFIG_USES_SERVICE_ACCOUNT =
  'google_api_gateway_api_config_uses_iam_service_account';

export const IngestionSources = {
  API_GATEWAY_APIS: 'api-gateway-apis',
  API_GATEWAY_API_CONFIGS: 'api-gateway-api-configs',
  API_GATEWAY_GATEWAYS: 'api-gateway-gateways',
};

export const ApiGatewayIngestionConfig = {
  [IngestionSources.API_GATEWAY_APIS]: {
    title: 'Google Cloud API Gateway APIs',
    description: 'Endpoint management for API gateways.',
    defaultsToDisabled: false,
  },
  [IngestionSources.API_GATEWAY_API_CONFIGS]: {
    title: 'Google Cloud API Gateway API Configurations',
    description: 'Config settings for API interfaces.',
    defaultsToDisabled: false,
  },
  [IngestionSources.API_GATEWAY_GATEWAYS]: {
    title: 'Google Cloud API Gateway Gateways',
    description: 'Networking gateways for API management.',
    defaultsToDisabled: false,
  },
};

export const ApiGatewayPermissions = {
  STEP_API_GATEWAY_APIS: [
    'apigateway.apis.getIamPolicy',
    'apigateway.apis.list',
  ],
  STEP_API_GATEWAY_API_CONFIGS: [
    'apigateway.apiconfigs.list',
    'apigateway.apiconfigs.getIamPolicy',
  ],
  STEP_API_GATEWAY_GATEWAYS: [
    'apigateway.gateways.list',
    'apigateway.gateways.getIamPolicy',
  ],
};
