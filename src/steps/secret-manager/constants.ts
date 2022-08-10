// https://cloud.google.com/secret-manager/docs/reference/rest/v1beta1/projects.secrets
export const STEP_SECRET_MANAGER_FETCH_SECRETS = 'fetch-secrets';
export const ENTITY_CLASS_SECRET_MANAGER_SECRET = 'Group';
export const ENTITY_TYPE_SECRET_MANAGER_SECRET = 'google_secret_manager_secret';

// https://cloud.google.com/secret-manager/docs/reference/rest/v1beta1/projects.secrets.versions
export const STEP_SECRET_MANAGER_FETCH_SECRET_VERSION = 'fetch-secret-versions';
export const ENTITY_CLASS_SECRET_MANAGER_SECRET_VERSION = 'Secret';
export const ENTITY_TYPE_SECRET_MANAGER_SECRET_VERSION =
  'google_secret_manager_secret_version';

export const RELATIONSHIP_TYPE_SECRET_HAS_VERSION =
  'google_secret_manager_secret_has_version';
