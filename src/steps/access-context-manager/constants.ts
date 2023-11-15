export const STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES =
  'fetch-access-context-manager-access-policies';
export const STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS =
  'fetch-access-context-manager-access-levels';
export const STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS =
  'fetch-access-context-manager-service-perimeters';

export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY = 'AccessPolicy';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY =
  'google_access_context_manager_access_policy';

export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL = 'Ruleset';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL =
  'google_access_context_manager_access_level';

export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER =
  'Configuration';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER =
  'google_access_context_manager_service_perimeter';

export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY =
  'ControlPolicy';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_EGRESS_POLICY =
  'google_access_context_manager_service_perimeter_egress_policy';

export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY =
  'ControlPolicy';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_INGRESS_POLICY =
  'google_access_context_manager_service_perimeter_ingress_policy';

export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION =
  'Configuration';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_API_OPERATION =
  'google_access_context_manager_service_perimeter_api_operation';

export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR =
  'Configuration';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER_METHOD_SELECTOR =
  'google_access_context_manager_service_perimeter_method_selector';

export const RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_ACCESS_LEVEL =
  'google_access_context_manager_access_policy_has_level';
export const RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_SERVICE_PERIMETER =
  'google_access_context_manager_access_policy_has_service_perimeter';
export const RELATIONSHIP_TYPE_SERVICE_PERIMETER_PROTECTS_PROJECT =
  'google_access_context_manager_service_perimeter_protects_project';
export const RELATIONSHIP_TYPE_SERVICE_PERIMETER_LIMITS_API_SERVICES =
  'google_access_context_manager_service_perimeter_limits_api_service';

export const RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_EGRESS_POLICY =
  'google_access_context_manager_service_perimeter_has_egress_policy';
export const RELATIONSHIP_TYPE_EGRESS_POLICY_HAS_API_OPERATION =
  'google_access_context_manager_service_perimeter_egress_policy_has_api_operation';
export const RELATIONSHIP_TYPE_API_OPERATION_HAS_METHOD_SELECTOR =
  'google_access_context_manager_service_perimeter_api_operation_has_method_selector';
export const RELATIONSHIP_TYPE_SERVICE_PERIMETER_HAS_INGRESS_POLICY =
  'google_access_context_manager_service_perimeter_has_ingress_policy';
export const RELATIONSHIP_TYPE_INGRESS_POLICY_HAS_API_OPERATION =
  'google_access_context_manager_service_perimeter_ingress_policy_has_api_operation';

export const IngestionSources = {
  ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES: 'acm-access-policies',
  ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS: 'acm-access-levels',
  ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS: 'acm-service-perimeters',
};

export const AccessContextManagerIngestionConfig = {
  [IngestionSources.ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
    title: 'Google Cloud Access Context Manager Access Policies',
    description: 'Defines secure access boundaries in GCP.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
    title: 'Google Cloud Access Context Manager Access Levels',
    description: 'Manages access via hierarchical levels in GCP.',
    defaultsToDisabled: false,
  },
  [IngestionSources.ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
    title: 'Google Cloud Access Context Manager Service Perimeters',
    description: 'Secures resources within network boundaries.',
    defaultsToDisabled: false,
  },
};
