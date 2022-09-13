import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
} from '../storage';

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
    targetType: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  },
  BUILD_USES_SOURCE_REPOSITORY: {
    _type: 'google_cloud_build_uses_source_repository',
    _class: RelationshipClass.USES,
    sourceType: CloudBuildEntitiesSpec.BUILD._type,
    targetType: 'google_cloud_source_repository',
  },
};

export const CloudBuildStepsSpec = {
  FETCH_BUILDS: {
    id: 'fetch-cloud-builds',
    name: 'Fetch Cloud Builds',
    entities: [CloudBuildEntitiesSpec.BUILD],
    relationships: [],
  },
  FETCH_BUILD_TRIGGERS: {
    id: 'fetch-cloud-build-triggers',
    name: 'Fetch Cloud Build Triggers',
    entities: [CloudBuildEntitiesSpec.BUILD_TRIGGER],
    relationships: [],
  },
  FETCH_BUILD_WORKER_POOLS: {
    id: 'fetch-cloud-build-worker-pools',
    name: 'Fetch Cloud Build Worker Pools',
    entities: [CloudBuildEntitiesSpec.BUILD_WORKER_POOL],
    relationships: [],
  },
  FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG: {
    id: 'fetch-cloud-build-ghe-configs',
    name: 'Fetch Cloud Build GitHub Enterprise Configs',
    entities: [CloudBuildEntitiesSpec.BUILD_GITHUB_ENTERPRISE_CONFIG],
    relationships: [],
  },
  FETCH_BUILD_BITBUCKET_SERVER_CONFIG: {
    id: 'fetch-cloud-build-bb-configs',
    name: 'Fetch Cloud Build BitBucket Server Configs',
    entities: [CloudBuildEntitiesSpec.BUILD_BITBUCKET_SERVER_CONFIG],
    relationships: [],
  },
  FETCH_BUILD_BITBUCKET_REPOS: {
    id: 'fetch-cloud-build-bb-repos',
    name: 'Fetch Cloud Build BitBucket Server Repos',
    entities: [CloudBuildEntitiesSpec.BUILD_BITBUCKET_REPO],
    dependsOn: ['fetch-cloud-build-bb-configs'],
    relationships: [CloudBuildRelationshipsSpec.BITBUCKET_SERVER_HAS_REPO],
  },
  BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS: {
    id: 'build-cloud-build-trigger-triggers-build-relationships',
    name: 'Build Cloud Build Trigger -> Cloud Build Relationships',
    entities: [],
    relationships: [CloudBuildRelationshipsSpec.BUILD_TRIGGER_TRIGGERS_BUILD],
    dependsOn: ['fetch-cloud-build-triggers', 'fetch-cloud-builds'],
  },
  BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS: {
    id: 'build-cloud-build-uses-storage-bucket-relationships',
    name: 'Build Cloud Build -> Storage Bucket Relationships',
    entities: [],
    relationships: [CloudBuildRelationshipsSpec.BUILD_USES_STORAGE_BUCKET],
    dependsOn: ['fetch-cloud-builds', STEP_CLOUD_STORAGE_BUCKETS],
  },
  BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS: {
    id: 'build-cloud-build-uses-source-repo-relationships',
    name: 'Build Cloud Build -> Source Repository Relationships',
    entities: [],
    relationships: [CloudBuildRelationshipsSpec.BUILD_USES_SOURCE_REPOSITORY],
    dependsOn: ['fetch-cloud-builds'], // 'fetch-cloud-storage-buckets'],
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
