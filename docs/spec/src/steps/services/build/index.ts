import {
  IntegrationInstanceConfig,
  RelationshipClass,
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
