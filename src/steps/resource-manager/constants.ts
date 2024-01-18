export const STEP_RESOURCE_MANAGER_ORGANIZATION =
  'fetch-resource-manager-organization';
export const STEP_RESOURCE_MANAGER_FOLDERS = 'fetch-resource-manager-folders';
export const STEP_RESOURCE_MANAGER_PROJECT = 'fetch-resource-manager-project';
export const STEP_RESOURCE_MANAGER_SKIPPED_PROJECTS =
  'fetch-resource-manager-skipped-projects';
export const STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS =
  'fetch-resource-manager-org-project-relationships';
export const STEP_AUDIT_CONFIG_IAM_POLICY = 'fetch-iam-policy-audit-config';

export const ORGANIZATION_ENTITY_TYPE = 'google_cloud_organization';
export const ORGANIZATION_ENTITY_CLASS = 'Organization';

export const FOLDER_ENTITY_TYPE = 'google_cloud_folder';
export const FOLDER_ENTITY_CLASS = 'Group';

export const PROJECT_ENTITY_TYPE = 'google_cloud_project';
export const PROJECT_ENTITY_CLASS = 'Account';

export const AUDIT_CONFIG_ENTITY_TYPE = 'google_cloud_audit_config';
export const AUDIT_CONFIG_ENTITY_CLASS = 'Configuration';

export const IAM_SERVICE_ACCOUNT_ASSIGNED_ROLE_RELATIONSHIP_TYPE =
  'google_iam_service_account_assigned_role';
export const ORGANIZATION_HAS_FOLDER_RELATIONSHIP_TYPE =
  'google_cloud_organization_has_folder';
export const FOLDER_HAS_FOLDER_RELATIONSHIP_TYPE =
  'google_cloud_folder_has_folder';
export const ORGANIZATION_HAS_PROJECT_RELATIONSHIP_TYPE =
  'google_organization_has_project';
export const FOLDER_HAS_PROJECT_RELATIONSHIP_TYPE = 'google_folder_has_project';
export const SERVICE_USES_AUDIT_CONFIG_RELATIONSHIP_TYPE =
  'google_cloud_api_service_uses_audit_config';

export const AUDIT_CONFIG_ALLOWS_SERVICE_ACCOUNT_RELATIONSHIP_TYPE =
  'google_cloud_audit_config_allows_iam_service_account';
export const AUDIT_CONFIG_ALLOWS_USER_RELATIONSHIP_TYPE =
  'google_cloud_audit_config_allows_user';
export const AUDIT_CONFIG_ALLOWS_GROUP_RELATIONSHIP_TYPE =
  'google_cloud_audit_config_allows_group';
export const AUDIT_CONFIG_ALLOWS_DOMAIN_RELATIONSHIP_TYPE =
  'google_cloud_audit_config_allows_domain';

export const IngestionSources = {
  RESOURCE_MANAGER_ORGANIZATION: 'resource-manager-organization',
  RESOURCE_MANAGER_FOLDERS: 'resource-manager-folders',
  RESOURCE_MANAGER_PROJECT: 'resource-manager-project',
  RESOURCE_MANAGER_SKIPPED_PROJECTS: 'resource-manager-skipped-projects',
  RESOURCE_MANAGER_AUDIT_CONFIG_IAM_POLICY:
    'resource-manager-audit-config-iam-policy',
};

export const ResourceManagerIngestionConfig = {
  [IngestionSources.RESOURCE_MANAGER_ORGANIZATION]: {
    title: 'GCP Resource Manager Organization',
    description: 'Organizational resource management.',
    defaultsToDisabled: false,
    cannotBeDisabled: true,
  },
  [IngestionSources.RESOURCE_MANAGER_FOLDERS]: {
    title: 'GCP Resource Manager Folders',
    description: 'Hierarchical organization of resources.',
    defaultsToDisabled: false,
    cannotBeDisabled: true,
  },
  [IngestionSources.RESOURCE_MANAGER_PROJECT]: {
    title: 'GCP Resource Manager Project',
    description: 'Projects for resource organization.',
    defaultsToDisabled: false,
  },
  [IngestionSources.RESOURCE_MANAGER_AUDIT_CONFIG_IAM_POLICY]: {
    title: 'GCP Audit Config IAM Policy',
    description: 'Audit configurations for IAM policies.',
    defaultsToDisabled: false,
  },
};
