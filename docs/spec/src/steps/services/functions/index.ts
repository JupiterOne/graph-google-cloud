import {
  IntegrationInstanceConfig,
  RelationshipClass,
  StepSpec,
} from '@jupiterone/integration-sdk-core';

export const functionSteps: StepSpec<IntegrationInstanceConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.google.com/functions/docs/reference/rest/v2/projects.locations.functions/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: cloudfunctions.functions.list
     */
    id: 'fetch-cloud-functions',
    name: 'Cloud Functions',
    entities: [
      {
        resourceName: 'Cloud Function',
        _type: 'google_cloud_function',
        _class: ['Function'],
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: true,
  },
  {
    /**
     * PROPERTY: google_cloud_function.eventTrigger.serviceAccountEmail
     * PATTERN: Build Child Relationships
     * REQUIRED PERMISSIONS: n/a
     */
    id: 'build-cloud-function-service-account-relationships',
    name: 'Cloud Function Service Account Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_function_uses_iam_service_account',
        _class: RelationshipClass.USES,
        sourceType: 'google_cloud_function',
        targetType: 'google_iam_service_account',
      },
    ],
    dependsOn: ['fetch-cloud-functions', 'fetch-iam-service-accounts'],
    implemented: true,
  },
  {
    /**
     * PROPERTY: google_cloud_function.buildConfig.source.storageSource
     * PATTERN: Build Child Relationships
     * REQUIRED PERMISSIONS: n/a
     */
    id: 'build-cloud-function-storage-bucket-relationships',
    name: 'Build Cloud Function -> Storage Bucket Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_function_uses_storage_bucket',
        _class: RelationshipClass.USES,
        sourceType: 'google_cloud_function',
        targetType: 'google_storage_bucket',
      },
    ],
    dependsOn: ['fetch-cloud-functions', 'fetch-cloud-storage-buckets'],
    implemented: true,
  },
  {
    /**
     * PROPERTY: google_cloud_function.buildConfig.source.repoSource
     * PATTERN: Build Child Relationships
     * REQUIRED PERMISSIONS: n/a
     */
    id: 'build-cloud-function-source-repo-relationships',
    name: 'Build Cloud Function -> Source Repository Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_function_uses_source_repository',
        _class: RelationshipClass.USES,
        sourceType: 'google_cloud_function',
        targetType: 'google_cloud_source_repository',
      },
    ],
    dependsOn: ['fetch-cloud-functions', 'fetch-cloud-source-repositories'],
    implemented: true,
  },
  {
    /**
     * PROPERTY: google_cloud_function.buildConfig.workerPool
     * PATTERN: Build Child Relationships
     * REQUIRED PERMISSIONS: n/a
     */
    id: 'build-cloud-function-worker-pool-relationships',
    name: 'Build Cloud Function -> Worker Pool Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_function_uses_custom_worker_pool',
        _class: RelationshipClass.USES,
        sourceType: 'google_cloud_function',
        targetType: 'google_cloud_custom_worker_pool',
      },
    ],
    dependsOn: ['fetch-cloud-functions', 'fetch-cloud-custom-worker-pools'],
    implemented: false,
  },
  {
    /**
     * PROPERTY: google_cloud_function.buildConfig.dockerRepository
     * PATTERN: Build Child Relationships
     * REQUIRED PERMISSIONS: n/a
     */
    id: 'build-cloud-function-docker-repository-relationships',
    name: 'Build Cloud Function -> Docker Repository Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_function_uses_docker_repository',
        _class: RelationshipClass.USES,
        sourceType: 'google_cloud_function',
        targetType: 'google_cloud_docker_repository',
      },
    ],
    dependsOn: ['fetch-cloud-functions', 'fetch-cloud-docker-repositories'],
    implemented: false,
  },
];
