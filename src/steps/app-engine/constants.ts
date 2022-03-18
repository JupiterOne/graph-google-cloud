export const STEP_APP_ENGINE_APPLICATION = 'fetch-app-engine-application';
export const STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS =
  'build-app-engine-application-bucket-relationships';
export const STEP_APP_ENGINE_SERVICES = 'fetch-app-engine-services';
export const STEP_APP_ENGINE_VERSIONS = 'fetch-app-engine-versions';
export const STEP_APP_ENGINE_INSTANCES = 'fetch-app-engine-instances';

export const ENTITY_TYPE_APP_ENGINE_APPLICATION =
  'google_app_engine_application';
export const ENTITY_CLASS_APP_ENGINE_APPLICATION = 'Application';

export const ENTITY_TYPE_APP_ENGINE_SERVICE = 'google_app_engine_service';
export const ENTITY_CLASS_APP_ENGINE_SERVICE = 'Container';

export const ENTITY_TYPE_APP_ENGINE_VERSION = 'google_app_engine_version';
export const ENTITY_CLASS_APP_ENGINE_VERSION = 'Service';

export const ENTITY_TYPE_APP_ENGINE_INSTANCE = 'google_app_engine_instance';
export const ENTITY_CLASS_APP_ENGINE_INSTANCE = 'Host';

export const RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_HAS_SERVICE =
  'google_app_engine_application_has_service';

export const RELATIONSHIP_TYPE_APP_ENGINE_SERVICE_HAS_VERSION =
  'google_app_engine_service_has_version';

export const RELATIONSHIP_TYPE_APP_ENGINE_VERSION_HAS_INSTANCE =
  'google_app_engine_version_has_instance';

export const RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_USES_BUCKET =
  'google_app_engine_application_uses_storage_bucket';

export const RELATIONSHIP_TYPE_GOOGLE_USER_CREATED_VERSION =
  'mapping_source_created_google_user';

export const RELATIONSHIP_TYPE_SERVICE_ACCOUNT_CREATED_VERSION =
  'google_iam_service_account_created_app_engine_version';
