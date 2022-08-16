import {
  IntegrationInstanceConfig,
  RelationshipClass,
  RelationshipDirection,
  StepSpec,
} from '@jupiterone/integration-sdk-core';

export const buildSteps: StepSpec<IntegrationInstanceConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.google.com/build/docs/api/reference/rest/v1/projects.builds/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: cloudbuild.builds.list
     */
    id: 'fetch-cloud-builds',
    name: 'Cloud Builds',
    entities: [
      {
        resourceName: 'Cloud Build',
        _type: 'google_cloud_build',
        _class: 'Workflow',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
  {
    /**
     * PROPERTY: google_cloud_build.source.storageSource
     * PATTERN: Build Child Relationships
     */
    id: 'build-cloud-build-storage-bucket-relationships',
    name: 'Build Cloud Build -> Storage Bucket Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_build_uses_storage_bucket',
        _class: RelationshipClass.USES,
        sourceType: 'google_cloud_build',
        targetType: 'google_storage_bucket',
      },
    ],
    dependsOn: ['fetch-cloud-builds', 'fetch-cloud-storage-buckets'],
    implemented: false,
  },
  {
    /**
     * PROPERTY: google_cloud_build.source.repoSource
     * PATTERN: Build Child Relationships
     */
    id: 'build-cloud-build-source-repo-relationships',
    name: 'Build Cloud Build -> Source Repository Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_build_uses_source_repository',
        _class: RelationshipClass.USES,
        sourceType: 'google_cloud_build',
        targetType: 'google_cloud_source_repository',
      },
    ],
    dependsOn: ['fetch-cloud-builds', 'fetch-cloud-source-repositories'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/build/docs/api/reference/rest/v1/projects.githubEnterpriseConfigs/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: cloudbuild.integrations.list
     */
    id: 'fetch-cloud-build-ghe-configs',
    name: 'Cloud Build GitHub Enterprise Configs',
    entities: [
      {
        resourceName: 'Cloud Build GitHub Enterprise Config',
        _type: 'google_cloud_github_enterprise_config',
        _class: 'Configuration',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
  {
    /**
     * PROPERTY: google_cloud_github_enterprise_config.hostUrl
     * PATTERN: Build Child Relationships
     */
    id: 'build-cloud-build-ghe-config-account-relationships',
    name: 'Build Cloud Build GitHub Enterprise Config -> GitHub Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [
      {
        _type: 'google_cloud_github_enterprise_config_connects_github_account',
        sourceType: 'google_cloud_github_enterprise_config',
        _class: RelationshipClass.CONNECTS,
        targetType: 'github_account',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    dependsOn: ['fetch-cloud-build-ghe-configs'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/build/docs/api/reference/rest/v1/projects.locations.bitbucketServerConfigs/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: ???
     * NOTE: Make sure to redact `apiKey` and `webhookKey`
     */
    id: 'fetch-cloud-build-bb-configs',
    name: 'Cloud Build BitBucket Server Configs',
    entities: [
      {
        resourceName: 'Cloud Build BitBucket Server Config',
        _type: 'google_cloud_bitbucket_server_config',
        _class: 'Configuration',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
  {
    /**
     * PROPERTY: google_cloud_bitbucket_server_config.hostUri
     * PATTERN: Build Child Relationships
     */
    id: 'build-cloud-build-bb-config-account-relationships',
    name: 'Build Cloud Build BitBucket Config -> BitBucket Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [
      {
        _type:
          'google_cloud_bitbucket_server_config_connects_bitbucket_project',
        sourceType: 'google_cloud_bitbucket_server_config',
        _class: RelationshipClass.CONNECTS,
        targetType: 'bitbucket_project',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    dependsOn: ['fetch-cloud-build-bb-configs'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/build/docs/api/reference/rest/v1/projects.locations.bitbucketServerConfigs.repos/list
     * PATTERN: Fetch Child Entities
     * REQUIRED PERMISSIONS: ???
     */
    id: 'fetch-cloud-build-bb-repos',
    name: 'Cloud Build BitBucket Server Repos',
    entities: [
      {
        resourceName: 'Cloud Build BitBucket Server Repo',
        _type: 'google_cloud_bitbucket_server_repo',
        _class: 'CodeRepo',
      },
    ],
    relationships: [
      {
        _type: 'google_cloud_bitbucket_server_config_has_repo',
        sourceType: 'google_cloud_bitbucket_server_config',
        _class: RelationshipClass.HAS,
        targetType: 'google_cloud_bitbucket_server_repo',
      },
    ],
    dependsOn: ['fetch-cloud-build-bb-configs'],
    implemented: false,
  },
  {
    /**
     * PROPERTY: google_cloud_bitbucket_server_repo.repoId
     * PATTERN: Build Child Relationships
     */
    id: 'fetch-cloud-build-bb-repos-relationships',
    name: 'Cloud Build BitBucket Repo -> BitBucket Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [
      {
        _type: 'google_cloud_bitbucket_server_repo_watches_bitbucket_repo',
        sourceType: 'google_cloud_bitbucket_server_repo',
        _class: RelationshipClass.MONITORS,
        targetType: 'bitbucket_repo',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    dependsOn: ['fetch-cloud-build-bb-repos'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/build/docs/api/reference/rest/v1/projects.locations.triggers/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: cloudbuilds.builds.list
     */
    id: 'fetch-cloud-build-triggers',
    name: 'Cloud Build Triggers',
    entities: [
      {
        resourceName: 'Cloud Build Trigger',
        _type: 'google_cloud_build_trigger',
        _class: 'Rule',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: google_cloud_build_trigger.build
     * PATTERN: Build Child Relationships
     */
    id: 'build-cloud-build-trigger-triggers-build-relationships',
    name: 'Build Cloud Build Trigger -> Build Relationships',
    entities: [],
    relationships: [
      {
        _type: 'google_cloud_build_trigger_triggers_build',
        sourceType: 'google_cloud_build_trigger',
        _class: RelationshipClass.TRIGGERS,
        targetType: 'google_cloud_build',
      },
    ],
    dependsOn: ['fetch-cloud-build-triggers', 'fetch-cloud-builds'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.google.com/build/docs/api/reference/rest/v1/projects.locations.workerPools/list
     * PATTERN: Fetch Entities
     * REQUIRED PERMISSIONS: cloudbuild.workerpools.list
     */
    id: 'fetch-cloud-build-worker-pools',
    name: 'Cloud Build Worker Pools',
    entities: [
      {
        resourceName: 'Cloud Build Worker Pool',
        _type: 'google_cloud_build_worker_pool',
        _class: 'Cluster',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
];
