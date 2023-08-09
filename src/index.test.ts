import { invocationConfig as specConfig } from '../docs/spec/src/index';
import {
  Entity,
  Step,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
} from '../test/recording';
import { getOrganizationSteps } from './getStepStartStates';
import { invocationConfig } from './index';
import {
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
  STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
} from './steps/access-context-manager/constants';
import {
  STEP_API_GATEWAY_APIS,
  STEP_API_GATEWAY_API_CONFIGS,
  STEP_API_GATEWAY_GATEWAYS,
} from './steps/api-gateway/constants';
import {
  STEP_APP_ENGINE_APPLICATION,
  STEP_APP_ENGINE_INSTANCES,
  STEP_APP_ENGINE_SERVICES,
  STEP_APP_ENGINE_VERSIONS,
  STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS,
} from './steps/app-engine/constants';
import {
  STEP_BIG_QUERY_DATASETS,
  STEP_BIG_QUERY_MODELS,
  STEP_BIG_QUERY_TABLES,
  STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS,
} from './steps/big-query/constants';
import {
  STEP_BIG_TABLE_APP_PROFILES,
  STEP_BIG_TABLE_BACKUPS,
  STEP_BIG_TABLE_CLUSTERS,
  STEP_BIG_TABLE_INSTANCES,
  STEP_BIG_TABLE_TABLES,
} from './steps/big-table/constants';
import {
  STEP_BILLING_BUDGETS,
  STEP_BUILD_ACCOUNT_BUDGET,
  STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
  STEP_BUILD_PROJECT_BUDGET,
} from './steps/billing-budgets/constants';
import { STEP_BINARY_AUTHORIZATION_POLICY } from './steps/binary-authorization/constants';
import {
  STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BASIC_ROLES,
  STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
  STEP_IAM_BINDINGS,
} from './steps/cloud-asset/constants';
import { STEP_BILLING_ACCOUNTS } from './steps/cloud-billing/constants';
import { CloudBuildStepsSpec } from './steps/cloud-build/constants';
import {
  STEP_CLOUD_RUN_CONFIGURATIONS,
  STEP_CLOUD_RUN_ROUTES,
  STEP_CLOUD_RUN_SERVICES,
} from './steps/cloud-run/constants';
import { CloudSourceRepositoriesStepsSpec } from './steps/cloud-source-repositories/constants';
import {
  STEP_COMPUTE_ADDRESSES,
  STEP_COMPUTE_BACKEND_BUCKETS,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
  STEP_COMPUTE_FIREWALLS,
  STEP_COMPUTE_FORWARDING_RULES,
  STEP_COMPUTE_GLOBAL_ADDRESSES,
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
  STEP_COMPUTE_HEALTH_CHECKS,
  STEP_COMPUTE_IMAGES,
  STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_INSTANCE_GROUPS,
  STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_COMPUTE_LOADBALANCERS,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
  STEP_COMPUTE_REGION_DISKS,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  STEP_COMPUTE_REGION_LOADBALANCERS,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_SNAPSHOTS,
  STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
  STEP_COMPUTE_SSL_POLICIES,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_TARGET_SSL_PROXIES,
  STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
} from './steps/compute';
import { STEP_CONTAINER_CLUSTERS } from './steps/containers';
import {
  STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS,
  STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS,
  STEP_DATAPROC_CLUSTERS,
  STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS,
} from './steps/dataproc/constants';
import {
  STEP_DNS_MANAGED_ZONES,
  STEP_DNS_POLICIES,
} from './steps/dns/constants';
import {
  STEP_IAM_CUSTOM_ROLES,
  STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS,
  STEP_IAM_MANAGED_ROLES,
  STEP_IAM_SERVICE_ACCOUNTS,
} from './steps/iam';
import { STEP_CLOUD_KMS_KEYS, STEP_CLOUD_KMS_KEY_RINGS } from './steps/kms';
import {
  STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS,
  STEP_LOGGING_METRICS,
  STEP_LOGGING_PROJECT_SINKS,
} from './steps/logging/constants';
import {
  STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS,
  STEP_MEMCACHE_INSTANCES,
} from './steps/memcache/constants';
import { STEP_MONITORING_ALERT_POLICIES } from './steps/monitoring/constants';
import { PrivatecaSteps } from './steps/privateca/constants';
import {
  STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS,
  STEP_PUBSUB_SUBSCRIPTIONS,
  STEP_PUBSUB_TOPICS,
} from './steps/pub-sub/constants';
import {
  STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS,
  STEP_REDIS_INSTANCES,
} from './steps/redis/constants';
import {
  STEP_AUDIT_CONFIG_IAM_POLICY,
  STEP_RESOURCE_MANAGER_FOLDERS,
  STEP_RESOURCE_MANAGER_ORGANIZATION,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
  STEP_RESOURCE_MANAGER_PROJECT,
} from './steps/resource-manager';
import { SecretManagerSteps } from './steps/secret-manager/constants';
import { ServiceUsageStepIds } from './steps/service-usage/constants';
import {
  STEP_SPANNER_INSTANCES,
  STEP_SPANNER_INSTANCE_CONFIGS,
  STEP_SPANNER_INSTANCE_DATABASES,
} from './steps/spanner/constants';
import { SqlAdminSteps, STEP_SQL_ADMIN_INSTANCES } from './steps/sql-admin';
import { IntegrationConfig } from './types';
import {
  STEP_CLOUD_FUNCTIONS,
  STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS,
  STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS,
} from './steps/functions';
import { StorageStepsSpec } from './steps/storage/constants';
import { WebSecurityScannerSteps } from './steps/web-security-scanner/constants';

describe('#getStepStartStates success', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'getStepStartStates',
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test.each([true, false])(
    'should return all enabled services when getStepStartStatesUsingServiceEnablements = %p',

    async (useEnablementsForStepStartStates) => {
      const stepStartStates = await invocationConfig.getStepStartStates?.(
        // Unless we want to change what this test does, we need to modify the
        // instanceConfig with configureOrganizationProjects: true, else not
        // all steps will be enabled it'll be disabled
        createMockExecutionContext({
          instanceConfig: {
            ...integrationConfig,
            useEnablementsForStepStartStates,
          },
        }),
      );

      const expectedStepStartStates: StepStartStates = {
        [STEP_RESOURCE_MANAGER_ORGANIZATION]: {
          disabled: false,
        },
        [STEP_RESOURCE_MANAGER_FOLDERS]: {
          disabled: false,
        },
        [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
          disabled: false,
        },
        [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
          disabled: false,
        },
        [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
          disabled: false,
        },
        [STEP_RESOURCE_MANAGER_PROJECT]: {
          disabled: false,
        },
        [ServiceUsageStepIds.FETCH_API_SERVICES]: {
          disabled: false,
        },
        [STEP_CLOUD_FUNCTIONS]: {
          disabled: false,
        },
        [STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS]: {
          disabled: false,
        },
        [StorageStepsSpec.FETCH_STORAGE_BUCKETS.id]: {
          disabled: false,
        },
        [STEP_IAM_CUSTOM_ROLES]: {
          disabled: false,
        },
        [STEP_IAM_MANAGED_ROLES]: {
          disabled: false,
        },
        [STEP_IAM_SERVICE_ACCOUNTS]: {
          disabled: false,
        },
        [STEP_AUDIT_CONFIG_IAM_POLICY]: {
          disabled: true,
        },
        [STEP_COMPUTE_DISKS]: {
          disabled: false,
        },
        [STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_DISK_KMS_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_REGION_DISKS]: {
          disabled: false,
        },
        [STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_SNAPSHOTS]: {
          disabled: false,
        },
        [STEP_COMPUTE_IMAGES]: {
          disabled: false,
        },
        [STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_NETWORKS]: {
          disabled: false,
        },
        [STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_ADDRESSES]: {
          disabled: false,
        },
        [STEP_COMPUTE_GLOBAL_ADDRESSES]: {
          disabled: false,
        },
        [STEP_COMPUTE_FIREWALLS]: {
          disabled: false,
        },
        [STEP_COMPUTE_FORWARDING_RULES]: {
          disabled: false,
        },
        [STEP_COMPUTE_GLOBAL_FORWARDING_RULES]: {
          disabled: false,
        },
        [STEP_COMPUTE_REGION_INSTANCE_GROUPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_REGION_BACKEND_SERVICES]: {
          disabled: false,
        },
        [STEP_COMPUTE_SUBNETWORKS]: {
          disabled: false,
        },
        [STEP_COMPUTE_PROJECT]: {
          disabled: false,
        },
        [STEP_COMPUTE_HEALTH_CHECKS]: {
          disabled: false,
        },
        [STEP_COMPUTE_REGION_HEALTH_CHECKS]: {
          disabled: false,
        },
        [STEP_COMPUTE_INSTANCES]: {
          disabled: false,
        },
        [STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_INSTANCE_GROUPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_LOADBALANCERS]: {
          disabled: false,
        },
        [STEP_COMPUTE_REGION_LOADBALANCERS]: {
          disabled: false,
        },
        [STEP_COMPUTE_BACKEND_SERVICES]: {
          disabled: false,
        },
        [STEP_COMPUTE_BACKEND_BUCKETS]: {
          disabled: false,
        },
        [STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_COMPUTE_TARGET_SSL_PROXIES]: {
          disabled: false,
        },
        [STEP_COMPUTE_TARGET_HTTPS_PROXIES]: {
          disabled: false,
        },
        [STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES]: {
          disabled: false,
        },
        [STEP_COMPUTE_TARGET_HTTP_PROXIES]: {
          disabled: false,
        },
        [STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES]: {
          disabled: false,
        },
        [STEP_COMPUTE_SSL_POLICIES]: {
          disabled: false,
        },
        [STEP_DNS_MANAGED_ZONES]: {
          disabled: false,
        },
        [STEP_DNS_POLICIES]: {
          disabled: false,
        },
        [STEP_CLOUD_KMS_KEY_RINGS]: {
          disabled: false,
        },
        [STEP_CLOUD_KMS_KEYS]: {
          disabled: false,
        },
        [STEP_SQL_ADMIN_INSTANCES]: {
          disabled: false,
        },
        [SqlAdminSteps.BUILD_SQL_INSTANCE_KMS_KEY_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CONTAINER_CLUSTERS]: {
          disabled: false,
        },
        [STEP_BIG_QUERY_DATASETS]: {
          disabled: false,
        },
        [STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_BIG_QUERY_MODELS]: {
          disabled: false,
        },
        [STEP_BIG_QUERY_TABLES]: {
          disabled: false,
        },
        [STEP_LOGGING_METRICS]: {
          disabled: false,
        },
        [STEP_LOGGING_PROJECT_SINKS]: {
          disabled: false,
        },
        [STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_MONITORING_ALERT_POLICIES]: {
          disabled: false,
        },
        [STEP_BINARY_AUTHORIZATION_POLICY]: {
          disabled: false,
        },
        [STEP_PUBSUB_TOPICS]: {
          disabled: false,
        },
        [STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_PUBSUB_SUBSCRIPTIONS]: {
          disabled: false,
        },
        [STEP_APP_ENGINE_APPLICATION]: {
          disabled: false,
        },
        [STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_APP_ENGINE_SERVICES]: {
          disabled: false,
        },
        [STEP_APP_ENGINE_VERSIONS]: {
          disabled: false,
        },
        [STEP_APP_ENGINE_INSTANCES]: {
          disabled: false,
        },
        [STEP_CLOUD_RUN_SERVICES]: {
          disabled: false,
        },
        [STEP_CLOUD_RUN_ROUTES]: {
          disabled: false,
        },
        [STEP_CLOUD_RUN_CONFIGURATIONS]: {
          disabled: false,
        },
        [STEP_REDIS_INSTANCES]: {
          disabled: false,
        },
        [STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_MEMCACHE_INSTANCES]: {
          disabled: false,
        },
        [STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_SPANNER_INSTANCE_CONFIGS]: {
          disabled: false,
        },
        [STEP_SPANNER_INSTANCES]: {
          disabled: false,
        },
        [STEP_SPANNER_INSTANCE_DATABASES]: {
          disabled: false,
        },
        [STEP_API_GATEWAY_APIS]: {
          disabled: false,
        },
        [STEP_API_GATEWAY_API_CONFIGS]: {
          disabled: false,
        },
        [STEP_API_GATEWAY_GATEWAYS]: {
          disabled: false,
        },
        [PrivatecaSteps.STEP_PRIVATE_CA_POOLS.id]: { disabled: false },
        [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id]: {
          disabled: false,
        },
        [PrivatecaSteps
          .STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS
          .id]: {
          disabled: false,
        },
        [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATES.id]: { disabled: false },
        [STEP_IAM_BINDINGS]: {
          disabled: false,
        },
        [STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CREATE_BASIC_ROLES]: {
          disabled: false,
        },
        [STEP_CREATE_BINDING_ROLE_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_DATAPROC_CLUSTERS]: {
          disabled: false,
        },
        [STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS]: {
          disabled: false,
        },
        [STEP_BIG_TABLE_INSTANCES]: {
          disabled: false,
        },
        [STEP_BIG_TABLE_APP_PROFILES]: {
          disabled: false,
        },
        [STEP_BIG_TABLE_CLUSTERS]: {
          disabled: false,
        },
        [STEP_BIG_TABLE_BACKUPS]: {
          disabled: false,
        },
        [STEP_BIG_TABLE_TABLES]: {
          disabled: false,
        },
        [STEP_BILLING_ACCOUNTS]: {
          disabled: false,
        },
        [STEP_BILLING_BUDGETS]: {
          disabled: false,
        },
        [STEP_BUILD_ACCOUNT_BUDGET]: {
          disabled: false,
        },
        [STEP_BUILD_PROJECT_BUDGET]: {
          disabled: false,
        },
        [STEP_BUILD_ADDITIONAL_PROJECT_BUDGET]: {
          disabled: false,
        },
        [SecretManagerSteps.FETCH_SECRETS.id]: {
          disabled: false,
        },
        [SecretManagerSteps.FETCH_SECRET_VERSIONS.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec.FETCH_BUILDS.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec
          .BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS
          .id]: {
          disabled: false,
        },
        [CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec
          .BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS.id]: {
          disabled: false,
        },
        [CloudBuildStepsSpec
          .BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id]: {
          disabled: false,
        },
        [WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id]: {
          disabled: false,
        },
        [WebSecurityScannerSteps.FETCH_SCAN_RUNS.id]: {
          disabled: false,
        },
      };

      expect(stepStartStates).toEqual(expectedStepStartStates);
    },
  );

  test('configureOrganizationProjects: true and organizationId: undefined: should disable billing and organization steps', async () => {
    const stepStartStates = await invocationConfig.getStepStartStates?.(
      createMockExecutionContext({
        instanceConfig: {
          ...integrationConfig,
          organizationId: undefined,
          configureOrganizationProjects: true,
        },
      }),
    );

    expect(stepStartStates).toMatchObject({
      [STEP_RESOURCE_MANAGER_ORGANIZATION]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_FOLDERS]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
        disabled: false,
      },
      [STEP_IAM_BINDINGS]: {
        disabled: false,
      },
      [STEP_CREATE_BASIC_ROLES]: {
        disabled: false,
      },
      [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_BILLING_BUDGETS]: {
        disabled: true,
      },
      [STEP_BUILD_ACCOUNT_BUDGET]: {
        disabled: true,
      },
      [STEP_BUILD_PROJECT_BUDGET]: {
        disabled: true,
      },
      [STEP_BILLING_ACCOUNTS]: {
        disabled: true,
      },
      [STEP_BUILD_ADDITIONAL_PROJECT_BUDGET]: {
        disabled: true,
      },
    });
  });

  test('configureOrganizationProjects: false or undefined, organizationId defined and projectId defined; should disable billing and organization steps', async () => {
    const stepStartStates = await invocationConfig.getStepStartStates?.(
      createMockExecutionContext({
        instanceConfig: {
          ...integrationConfig,
          configureOrganizationProjects: false,
        },
      }),
    );

    expect(stepStartStates).toMatchObject({
      [STEP_RESOURCE_MANAGER_ORGANIZATION]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_FOLDERS]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
        disabled: false,
      },
      [STEP_IAM_BINDINGS]: {
        disabled: false,
      },
      [STEP_CREATE_BASIC_ROLES]: {
        disabled: false,
      },
      [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_BILLING_BUDGETS]: {
        disabled: true,
      },
      [STEP_BUILD_ACCOUNT_BUDGET]: {
        disabled: true,
      },
      [STEP_BUILD_PROJECT_BUDGET]: {
        disabled: true,
      },
      [STEP_BILLING_ACCOUNTS]: {
        disabled: true,
      },
      [STEP_BUILD_ADDITIONAL_PROJECT_BUDGET]: {
        disabled: true,
      },
    });
  });

  test('configureOrganizationProjects: false or undefined, organizationId: undefined and projectId defined; should enable binding and billing steps and disable organization steps.', async () => {
    const stepStartStates = await invocationConfig.getStepStartStates?.(
      createMockExecutionContext({
        instanceConfig: {
          ...integrationConfig,
          projectId: integrationConfig.serviceAccountKeyConfig.project_id,
          configureOrganizationProjects: false,
          organizationId: undefined,
        },
      }),
    );

    expect(stepStartStates).toMatchObject({
      [STEP_RESOURCE_MANAGER_ORGANIZATION]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_FOLDERS]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
        disabled: true,
      },
      [STEP_IAM_BINDINGS]: {
        disabled: false,
      },
      [STEP_CREATE_BASIC_ROLES]: {
        disabled: false,
      },
      [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_BILLING_BUDGETS]: {
        disabled: false,
      },
      [STEP_BUILD_ACCOUNT_BUDGET]: {
        disabled: false,
      },
      [STEP_BUILD_PROJECT_BUDGET]: {
        disabled: false,
      },
      [STEP_BILLING_ACCOUNTS]: {
        disabled: false,
      },
      [STEP_BUILD_ADDITIONAL_PROJECT_BUDGET]: {
        disabled: true,
      },
    });
  });
});

describe('#beforeAddEntity', () => {
  test('should add projectId property to entity if projectId is not set', () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: 'my_type',
    };

    expect(
      invocationConfig.beforeAddEntity &&
        invocationConfig.beforeAddEntity(context, mockEntity),
    ).toEqual({
      ...mockEntity,
      projectId:
        context.instance.config.projectId ??
        context.instance.config.serviceAccountKeyConfig.project_id,
    });
  });

  test('should not override projectId property on entity', () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: 'my_type',
      projectId: 'my-project-id',
    };

    expect(
      invocationConfig.beforeAddEntity &&
        invocationConfig.beforeAddEntity(context, mockEntity),
    ).toEqual({
      ...mockEntity,
      projectId: 'my-project-id',
    });
  });
});

describe('#dependencies', () => {
  test('getOrganizationSteps should not depend on non-active steps', () => {
    expect(invocationConfig.integrationSteps).toHaveIsolatedDependencies(
      getOrganizationSteps(),
    );
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveIsolatedDependencies(stepCollection: string[]): R;
    }
  }
}

expect.extend({
  toHaveIsolatedDependencies(
    integrationSteps: Step<any>[],
    stepCollection: string[],
  ) {
    for (const stepId of stepCollection) {
      const stepDependencies = integrationSteps.find((s) => s.id === stepId)
        ?.dependsOn;

      const invalidStepDependencies = stepDependencies?.filter(
        (s) => !stepCollection.includes(s),
      );
      if (invalidStepDependencies?.length) {
        return {
          message: () =>
            `Step '${stepId}' contains invalid step dependencies: [${invalidStepDependencies}]`,
          pass: false,
        };
      }
    }
    return {
      message: () => '',
      pass: true,
    };
  },
});

test('implemented integration should match spec', () => {
  expect(invocationConfig).toImplementSpec(specConfig);
});
