export const STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES =
  'fetch-access-context-manager-access-policies';
export const STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS =
  'fetch-access-context-manager-access-levels';
export const STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS =
  'fetch-access-context-manager-service-perimeters';

// Ideas: AccessPolicy, Policy
// also it HAS access_levels and service_perimeters too (maybe a Group too)
export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY = 'AccessPolicy';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY =
  'google_access_context_manager_access_policy';

// Ideas: Config, Requirement, Rule, Ruleset, ...
export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL = 'Ruleset';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_LEVEL =
  'google_access_context_manager_access_level';

// Ideas: Config, Ruleset
export const ENTITY_CLASS_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER =
  'Configuration';
export const ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETER =
  'google_access_context_manager_service_perimeter';

export const RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_ACCESS_LEVEL =
  'google_access_context_manager_access_policy_has_level';
export const RELATIONSHIP_TYPE_ACCESS_POLICY_HAS_SERVICE_PERIMETER =
  'google_access_context_manager_access_policy_has_service_perimeter';
export const RELATIONSHIP_TYPE_SERVICE_PERIMETER_PROTECTS_PROJECT =
  'google_access_context_manager_service_perimeter_protects_project';
