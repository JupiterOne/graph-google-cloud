export const STEP_IAM_CUSTOM_ROLES = 'fetch-iam-custom-roles';
export const STEP_IAM_MANAGED_ROLES = 'fetch-iam-managed-roles';
export const STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS =
  'build-iam-custom-role-service-api-relationships';
export const IAM_ROLE_ENTITY_CLASS = 'AccessRole';
export const IAM_ROLE_ENTITY_TYPE = 'google_iam_role';

export const STEP_IAM_SERVICE_ACCOUNTS = 'fetch-iam-service-accounts';
export const IAM_SERVICE_ACCOUNT_ENTITY_CLASS = 'User';
export const IAM_SERVICE_ACCOUNT_ENTITY_TYPE = 'google_iam_service_account';
export const IAM_SERVICE_ACCOUNT_KEY_ENTITY_CLASS = 'AccessKey';
export const IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE =
  'google_iam_service_account_key';
export const IAM_SERVICE_ACCOUNT_HAS_KEY_RELATIONSHIP_TYPE =
  'google_iam_service_account_has_key';
export const IAM_USER_ENTITY_CLASS = 'User';
export const GOOGLE_USER_ENTITY_TYPE = 'google_user';
export const GOOGLE_USER_ENTITY_CLASS = 'User';
export const GOOGLE_GROUP_ENTITY_TYPE = 'google_group';
export const GOOGLE_GROUP_ENTITY_CLASS = 'UserGroup';
export const GOOGLE_DOMAIN_ENTITY_TYPE = 'google_domain';
export const GOOGLE_DOMAIN_ENTITY_CLASS = 'Domain';
export const ALL_AUTHENTICATED_USERS_TYPE = 'google_cloud_authenticated_users';
export const EVERYONE_TYPE = 'everyone';

export const API_SERVICE_HAS_IAM_ROLE_RELATIONSHIP_TYPE =
  'google_cloud_api_service_has_iam_role';
