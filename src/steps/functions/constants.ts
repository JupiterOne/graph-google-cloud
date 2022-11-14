import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { CloudSourceRepositoriesEntitiesSpec } from '../cloud-source-repositories/constants';
import { IAM_SERVICE_ACCOUNT_ENTITY_TYPE } from '../iam';
import { StorageEntitiesSpec } from '../storage/constants';

export const CLOUD_FUNCTION_ENTITY_CLASS = 'Function';
export const CLOUD_FUNCTION_ENTITY_TYPE = 'google_cloud_function';

export const STEP_CLOUD_FUNCTIONS = 'fetch-cloud-functions';
export const STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS =
  'build-cloud-function-service-account-relationships';
export const STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS =
  'build-cloud-function-source-repo-relationships';
export const STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS =
  'build-cloud-function-storage-bucket-relationships';

export const FunctionStepsSpec = {
  FETCH_CLOUD_FUNCTIONS: {
    id: 'fetch-cloud-functions',
    name: 'Cloud Functions',
  },
  CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS: {
    id: 'build-cloud-function-service-account-relationships',
    name: 'Cloud Function Service Account Relationships',
  },
  CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIP: {
    id: 'build-cloud-function-source-repo-relationships',
    name: 'Build Cloud Function -> Source Repository Relationships',
  },
  CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIP: {
    id: 'build-cloud-function-storage-bucket-relationships',
    name: 'Build Cloud Function -> Storage Bucket Relationships',
  },
};

export const FunctionEntitiesSpec = {
  CLOUD_FUNCTION: {
    resourceName: 'Cloud Function',
    _type: 'google_cloud_function',
    _class: ['Function'],
  },
};

export const FunctionsRelationshipsSpec = {
  GOOGLE_CLOUD_FUNCTION_USES_IAM_SERVICE_ACCOUNT: {
    _class: RelationshipClass.USES,
    _type: 'google_cloud_function_uses_iam_service_account',
    sourceType: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
    targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  },
  GOOGLE_CLOUD_FUNCTION_USES_SOURCE_REPOSITORY: {
    _type: 'google_cloud_function_uses_source_repository',
    _class: RelationshipClass.USES,
    sourceType: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
    targetType: CloudSourceRepositoriesEntitiesSpec.REPOSITORY._type,
  },
  GOOGLE_CLOUD_FUNCTION_USES_STORAGE_BUCKET: {
    _type: 'google_cloud_function_uses_storage_bucket',
    _class: RelationshipClass.USES,
    sourceType: FunctionEntitiesSpec.CLOUD_FUNCTION._type,
    targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
  },
};
