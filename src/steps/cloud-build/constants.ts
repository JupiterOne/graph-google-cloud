import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { CloudSourceRepositoriesEntitiesSpec } from '../cloud-source-repositories/constants';
import { StorageEntitiesSpec } from '../storage/constants';

export const CloudBuildEntitiesSpec = {
  BUILD: {
    resourceName: 'Cloud Build',
    _type: 'google_cloud_build',
    _class: ['Workflow'],
  },
  BUILD_TRIGGER: {
    resourceName: 'Cloud Build Trigger',
    _type: 'google_cloud_build_trigger',
    _class: ['Rule'],
  },
  BUILD_WORKER_POOL: {
    resourceName: 'Cloud Build Worker Pool',
    _type: 'google_cloud_build_worker_pool',
    _class: ['Cluster'],
  },
  BUILD_GITHUB_ENTERPRISE_CONFIG: {
    resourceName: 'Cloud Build GitHub Enterprise Config',
    _type: 'google_cloud_github_enterprise_config',
    _class: ['Configuration'],
  },
  BUILD_BITBUCKET_SERVER_CONFIG: {
    resourceName: 'Cloud Build BitBucket Server Config',
    _type: 'google_cloud_bitbucket_server_config',
    _class: ['Configuration'],
  },
  BUILD_BITBUCKET_REPO: {
    resourceName: 'Cloud Build BitBucket Server Repo',
    _type: 'google_cloud_bitbucket_server_repo',
    _class: ['CodeRepo'],
  },
};

export const CloudBuildRelationshipsSpec = {
  BITBUCKET_SERVER_HAS_REPO: {
    _type: 'google_cloud_bitbucket_server_config_has_repo',
    sourceType: CloudBuildEntitiesSpec.BUILD_BITBUCKET_SERVER_CONFIG._type,
    _class: RelationshipClass.HAS,
    targetType: CloudBuildEntitiesSpec.BUILD_BITBUCKET_REPO._type,
  },
  BUILD_TRIGGER_TRIGGERS_BUILD: {
    _type: 'google_cloud_build_trigger_triggers_build',
    sourceType: CloudBuildEntitiesSpec.BUILD_TRIGGER._type,
    _class: RelationshipClass.TRIGGERS,
    targetType: CloudBuildEntitiesSpec.BUILD._type,
  },
  BUILD_USES_STORAGE_BUCKET: {
    _type: 'google_cloud_build_uses_storage_bucket',
    _class: RelationshipClass.USES,
    sourceType: CloudBuildEntitiesSpec.BUILD._type,
    targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
  },
  BUILD_USES_SOURCE_REPOSITORY: {
    _type: 'google_cloud_build_uses_source_repository',
    _class: RelationshipClass.USES,
    sourceType: CloudBuildEntitiesSpec.BUILD._type,
    targetType: CloudSourceRepositoriesEntitiesSpec.REPOSITORY._type,
  },
};

export const CloudBuildStepsSpec = {
  FETCH_BUILDS: {
    id: 'fetch-cloud-builds',
    name: 'Fetch Cloud Builds',
  },
  FETCH_BUILD_TRIGGERS: {
    id: 'fetch-cloud-build-triggers',
    name: 'Fetch Cloud Build Triggers',
  },
  FETCH_BUILD_WORKER_POOLS: {
    id: 'fetch-cloud-build-worker-pools',
    name: 'Fetch Cloud Build Worker Pools',
  },
  FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG: {
    id: 'fetch-cloud-build-ghe-configs',
    name: 'Fetch Cloud Build GitHub Enterprise Configs',
  },
  FETCH_BUILD_BITBUCKET_SERVER_CONFIG: {
    id: 'fetch-cloud-build-bb-configs',
    name: 'Fetch Cloud Build BitBucket Server Configs',
  },
  FETCH_BUILD_BITBUCKET_REPOS: {
    id: 'fetch-cloud-build-bb-repos',
    name: 'Fetch Cloud Build BitBucket Server Repos',
  },
  BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS: {
    id: 'build-cloud-build-trigger-triggers-build-relationships',
    name: 'Build Cloud Build Trigger -> Cloud Build Relationships',
  },
  BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS: {
    id: 'build-cloud-build-uses-storage-bucket-relationships',
    name: 'Build Cloud Build -> Storage Bucket Relationships',
  },
  BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS: {
    id: 'build-cloud-build-uses-source-repo-relationships',
    name: 'Build Cloud Build -> Source Repository Relationships',
  },
  BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS: {
    id: 'build-cloud-build-trigger-uses-github-repo',
    name: 'Build Cloud Build Trigger -> Github Repository Relationships',
  },
};

// https://cloud.google.com/build/docs/locations
export const CloudBuildLocations = [
  'asia-south1',
  'asia-south2',
  'asia-southeast1',
  'asia-southeast2',
  'australia-southeast1',
  'australia-southeast2',
  'europe-central2',
  'europe-north1',
  'europe-west1',
  'europe-west2',
  'europe-west3',
  'europe-west4',
  'europe-west6',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us-central1',
  'us-east1',
  'us-east4',
  'us-west1',
  'us-west2',
  'us-west3',
  'us-west4',
];
