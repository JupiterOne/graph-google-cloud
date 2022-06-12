import {
  IntegrationExecutionContext,
  StepStartStates,
  StepStartState,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { SerializedIntegrationConfig } from './types';
import {
  STEP_CLOUD_FUNCTIONS,
  STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS,
} from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';
import { ServiceUsageStepIds } from './steps/service-usage/constants';
import {
  STEP_IAM_CUSTOM_ROLES,
  STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS,
  STEP_IAM_MANAGED_ROLES,
  STEP_IAM_SERVICE_ACCOUNTS,
} from './steps/iam';
import {
  STEP_RESOURCE_MANAGER_PROJECT,
  STEP_RESOURCE_MANAGER_ORGANIZATION,
  STEP_RESOURCE_MANAGER_FOLDERS,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
  STEP_AUDIT_CONFIG_IAM_POLICY,
} from './steps/resource-manager';
import {
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_FIREWALLS,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_LOADBALANCERS,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_BACKEND_BUCKETS,
  STEP_COMPUTE_TARGET_SSL_PROXIES,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_SSL_POLICIES,
  STEP_COMPUTE_INSTANCE_GROUPS,
  STEP_COMPUTE_HEALTH_CHECKS,
  STEP_COMPUTE_IMAGES,
  STEP_COMPUTE_SNAPSHOTS,
  STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
  STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
  STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_COMPUTE_ADDRESSES,
  STEP_COMPUTE_FORWARDING_RULES,
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
  STEP_COMPUTE_REGION_DISKS,
  STEP_COMPUTE_REGION_LOADBALANCERS,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_GLOBAL_ADDRESSES,
  STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
  STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
  STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
} from './steps/compute';
import { STEP_CLOUD_KMS_KEYS, STEP_CLOUD_KMS_KEY_RINGS } from './steps/kms';
import {
  STEP_BIG_QUERY_DATASETS,
  STEP_BIG_QUERY_MODELS,
  STEP_BIG_QUERY_TABLES,
  STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS,
} from './steps/big-query';
import { SqlAdminSteps, STEP_SQL_ADMIN_INSTANCES } from './steps/sql-admin';
import {
  STEP_DNS_MANAGED_ZONES,
  STEP_DNS_POLICIES,
} from './steps/dns/constants';
import { STEP_CONTAINER_CLUSTERS } from './steps/containers';
import {
  STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS,
  STEP_LOGGING_METRICS,
  STEP_LOGGING_PROJECT_SINKS,
} from './steps/logging/constants';
import { STEP_MONITORING_ALERT_POLICIES } from './steps/monitoring/constants';
import { STEP_BINARY_AUTHORIZATION_POLICY } from './steps/binary-authorization/constants';
import {
  STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS,
  STEP_PUBSUB_SUBSCRIPTIONS,
  STEP_PUBSUB_TOPICS,
} from './steps/pub-sub/constants';
import {
  STEP_APP_ENGINE_APPLICATION,
  STEP_APP_ENGINE_INSTANCES,
  STEP_APP_ENGINE_SERVICES,
  STEP_APP_ENGINE_VERSIONS,
  STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS,
} from './steps/app-engine/constants';
import {
  STEP_CLOUD_RUN_CONFIGURATIONS,
  STEP_CLOUD_RUN_ROUTES,
  STEP_CLOUD_RUN_SERVICES,
} from './steps/cloud-run/constants';
import {
  STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS,
  STEP_MEMCACHE_INSTANCES,
} from './steps/memcache/constants';
import {
  STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS,
  STEP_REDIS_INSTANCES,
} from './steps/redis/constants';
import {
  STEP_SPANNER_INSTANCES,
  STEP_SPANNER_INSTANCE_CONFIGS,
  STEP_SPANNER_INSTANCE_DATABASES,
} from './steps/spanner/constants';
import {
  STEP_API_GATEWAY_APIS,
  STEP_API_GATEWAY_API_CONFIGS,
  STEP_API_GATEWAY_GATEWAYS,
} from './steps/api-gateway/constants';
import {
  STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS,
  STEP_PRIVATE_CA_CERTIFICATES,
  STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
} from './steps/privateca/constants';
import {
  STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
  STEP_CREATE_BASIC_ROLES,
  STEP_IAM_BINDINGS,
  STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
} from './steps/cloud-asset/constants';
import {
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
  STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
} from './steps/access-context-manager/constants';
import {
  STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS,
  STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS,
  STEP_DATAPROC_CLUSTERS,
  STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS,
} from './steps/dataproc/constants';
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
import { STEP_BILLING_ACCOUNTS } from './steps/cloud-billing/constants';
import { isMasterOrganizationInstance } from './utils/isMasterOrganizationInstance';
import { isSingleProjectInstance } from './utils/isSingleProjectInstance';
import { deserializeIntegrationConfig } from './utils/integrationConfig';

function makeStepStartStates(
  stepIds: string[],
  stepStartState: StepStartState,
): StepStartStates {
  const stepStartStates: StepStartStates = {};
  for (const stepId of stepIds) {
    stepStartStates[stepId] = stepStartState;
  }
  return stepStartStates;
}

// Idea here is that we encapsulate/group all the steps that should be run
// when configureOrganizationProjects is set
export function getOrganizationSteps() {
  return [
    STEP_RESOURCE_MANAGER_ORGANIZATION,
    STEP_RESOURCE_MANAGER_FOLDERS,
    STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
  ];
}

function validateInvocationConfig(config: SerializedIntegrationConfig) {
  if (!config.serviceAccountKeyFile) {
    throw new IntegrationValidationError(
      'Missing a required integration config value {serviceAccountKeyFile}',
    );
  }
}

export default async function getStepStartStates(
  context: IntegrationExecutionContext<SerializedIntegrationConfig>,
): Promise<StepStartStates> {
  const { instance, logger } = context;
  const { config: serializedIntegrationConfig } = instance;

  validateInvocationConfig(serializedIntegrationConfig);

  // Override the incoming config with the new config that has parsed service
  // account data
  const config = (context.instance.config = deserializeIntegrationConfig(
    serializedIntegrationConfig,
  ));

  logger.info(
    {
      projectId: config.projectId,
      configureOrganizationProjects: config.configureOrganizationProjects,
      organizationId: config.organizationId,
      serviceAccountKeyEmail: config.serviceAccountKeyConfig.client_email,
      serviceAccountKeyProjectId: config.serviceAccountKeyConfig.project_id,
      folderId: config.folderId,
    },
    'Starting integration with config',
  );

  logger.publishEvent({
    name: 'integration_config',
    description: `Starting Google Cloud integration with service account (email=${
      config.serviceAccountKeyConfig.client_email
    }, configureOrganizationProjects=${!!config.configureOrganizationProjects})`,
  });

  const masterOrgInstance = isMasterOrganizationInstance(config);
  const singleProjectInstance = isSingleProjectInstance(config);
  const organizationSteps = { disabled: !masterOrgInstance }; // Only run organization steps if you are the master organization.

  logger.info(
    {
      masterOrgInstance,
      singleProjectInstance,
    },
    'Calculating step start states',
  );

  function createOrgStepStartState(): StepStartState {
    return {
      disabled: singleProjectInstance,
    };
  }

  const stepStartStates: StepStartStates = {
    // Organization-required steps
    ...makeStepStartStates([...getOrganizationSteps()], organizationSteps),
    [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: createOrgStepStartState(),
    [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: createOrgStepStartState(),
    [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: createOrgStepStartState(),
    [STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS]: createOrgStepStartState(),

    // Rest of steps...
    // This API will be enabled otherwise fetching services names above would fail
    [STEP_RESOURCE_MANAGER_PROJECT]: { disabled: false },
    [ServiceUsageStepIds.FETCH_API_SERVICES]: { disabled: false },
    [STEP_IAM_BINDINGS]: { disabled: false },
    [STEP_CREATE_BASIC_ROLES]: { disabled: false },
    [STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS]: { disabled: false },
    [STEP_CREATE_BINDING_ROLE_RELATIONSHIPS]: { disabled: false },
    [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]: { disabled: false },
    [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]: { disabled: false },
    [STEP_CLOUD_FUNCTIONS]: { disabled: false },
    [STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS]: { disabled: false },
    [STEP_CLOUD_STORAGE_BUCKETS]: { disabled: false },
    [STEP_IAM_CUSTOM_ROLES]: { disabled: false },
    [STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS]: { disabled: false },
    [STEP_IAM_MANAGED_ROLES]: { disabled: false },
    [STEP_IAM_SERVICE_ACCOUNTS]: { disabled: false },
    [STEP_AUDIT_CONFIG_IAM_POLICY]: {
      disabled: !!config.configureOrganizationProjects,
    },
    [STEP_COMPUTE_DISKS]: { disabled: false },
    [STEP_COMPUTE_REGION_DISKS]: { disabled: false },
    [STEP_COMPUTE_IMAGES]: { disabled: false },
    [STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS]: { disabled: false },
    [STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS]: { disabled: false },
    [STEP_COMPUTE_DISK_KMS_RELATIONSHIPS]: { disabled: false },
    [STEP_COMPUTE_SNAPSHOTS]: { disabled: false },
    [STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS]: { disabled: false },
    [STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS]: { disabled: false },
    [STEP_COMPUTE_NETWORKS]: { disabled: false },
    [STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS]: { disabled: false },
    [STEP_COMPUTE_ADDRESSES]: { disabled: false },
    [STEP_COMPUTE_GLOBAL_ADDRESSES]: { disabled: false },
    [STEP_COMPUTE_FORWARDING_RULES]: { disabled: false },
    [STEP_COMPUTE_GLOBAL_FORWARDING_RULES]: { disabled: false },
    [STEP_COMPUTE_FIREWALLS]: { disabled: false },
    [STEP_COMPUTE_SUBNETWORKS]: { disabled: false },
    [STEP_COMPUTE_PROJECT]: { disabled: false },
    [STEP_COMPUTE_HEALTH_CHECKS]: { disabled: false },
    [STEP_COMPUTE_REGION_HEALTH_CHECKS]: { disabled: false },
    [STEP_COMPUTE_INSTANCES]: { disabled: false },
    [STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS]: { disabled: false },
    [STEP_COMPUTE_INSTANCE_GROUPS]: { disabled: false },
    [STEP_COMPUTE_REGION_INSTANCE_GROUPS]: { disabled: false },
    [STEP_COMPUTE_LOADBALANCERS]: { disabled: false },
    [STEP_COMPUTE_REGION_LOADBALANCERS]: { disabled: false },
    [STEP_COMPUTE_BACKEND_SERVICES]: { disabled: false },
    [STEP_COMPUTE_REGION_BACKEND_SERVICES]: { disabled: false },
    [STEP_COMPUTE_BACKEND_BUCKETS]: { disabled: false },
    [STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS]: {
      disabled: false,
    },
    [STEP_COMPUTE_TARGET_SSL_PROXIES]: { disabled: false },
    [STEP_COMPUTE_TARGET_HTTPS_PROXIES]: { disabled: false },
    [STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES]: { disabled: false },
    [STEP_COMPUTE_TARGET_HTTP_PROXIES]: { disabled: false },
    [STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES]: { disabled: false },
    [STEP_COMPUTE_SSL_POLICIES]: { disabled: false },
    [STEP_CLOUD_KMS_KEY_RINGS]: { disabled: false },
    [STEP_CLOUD_KMS_KEYS]: { disabled: false },
    [STEP_BIG_QUERY_DATASETS]: { disabled: false },
    [STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS]: { disabled: false },
    [STEP_BIG_QUERY_MODELS]: { disabled: false },
    [STEP_BIG_QUERY_TABLES]: { disabled: false },
    [STEP_SQL_ADMIN_INSTANCES]: { disabled: false },
    [SqlAdminSteps.BUILD_SQL_INSTANCE_KMS_KEY_RELATIONSHIPS]: {
      disabled: false,
    },
    [STEP_DNS_MANAGED_ZONES]: { disabled: false },
    [STEP_DNS_POLICIES]: { disabled: false },
    [STEP_CONTAINER_CLUSTERS]: { disabled: false },
    [STEP_LOGGING_PROJECT_SINKS]: { disabled: false },
    [STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS]: {
      disabled: false,
    },
    [STEP_LOGGING_METRICS]: { disabled: false },
    [STEP_MONITORING_ALERT_POLICIES]: { disabled: false },
    [STEP_BINARY_AUTHORIZATION_POLICY]: { disabled: false },
    [STEP_PUBSUB_TOPICS]: { disabled: false },
    [STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS]: { disabled: false },
    [STEP_PUBSUB_SUBSCRIPTIONS]: { disabled: false },
    [STEP_APP_ENGINE_APPLICATION]: { disabled: false },
    [STEP_APP_ENGINE_SERVICES]: { disabled: false },
    [STEP_APP_ENGINE_VERSIONS]: { disabled: false },
    [STEP_APP_ENGINE_INSTANCES]: { disabled: false },
    [STEP_CLOUD_RUN_SERVICES]: { disabled: false },
    [STEP_CLOUD_RUN_ROUTES]: { disabled: false },
    [STEP_CLOUD_RUN_CONFIGURATIONS]: { disabled: false },
    [STEP_REDIS_INSTANCES]: { disabled: false },
    [STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS]: { disabled: false },
    [STEP_MEMCACHE_INSTANCES]: { disabled: false },
    [STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS]: { disabled: false },
    [STEP_SPANNER_INSTANCES]: { disabled: false },
    [STEP_SPANNER_INSTANCE_CONFIGS]: { disabled: false },
    [STEP_SPANNER_INSTANCE_DATABASES]: { disabled: false },
    [STEP_API_GATEWAY_APIS]: { disabled: false },
    [STEP_API_GATEWAY_API_CONFIGS]: { disabled: false },
    [STEP_API_GATEWAY_GATEWAYS]: { disabled: false },
    [STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES]: { disabled: false },
    [STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS]: {
      disabled: false,
    },
    [STEP_PRIVATE_CA_CERTIFICATES]: { disabled: false },
    [STEP_DATAPROC_CLUSTERS]: { disabled: false },
    [STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS]: { disabled: false },
    [STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS]: { disabled: false },
    [STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS]: { disabled: false },
    [STEP_BIG_TABLE_INSTANCES]: { disabled: false },
    [STEP_BIG_TABLE_APP_PROFILES]: { disabled: false },
    [STEP_BIG_TABLE_CLUSTERS]: { disabled: false },
    [STEP_BIG_TABLE_BACKUPS]: { disabled: false },
    [STEP_BIG_TABLE_TABLES]: { disabled: false },
    [STEP_BILLING_BUDGETS]: {
      disabled: !(singleProjectInstance || masterOrgInstance),
    },
    [STEP_BUILD_ACCOUNT_BUDGET]: {
      disabled: !(singleProjectInstance || masterOrgInstance),
    },
    [STEP_BUILD_PROJECT_BUDGET]: {
      disabled: !(singleProjectInstance || masterOrgInstance),
    },
    [STEP_BILLING_ACCOUNTS]: {
      disabled: !(singleProjectInstance || masterOrgInstance),
    },
    [STEP_BUILD_ADDITIONAL_PROJECT_BUDGET]: { disabled: !masterOrgInstance },
  };

  logger.info(
    { stepStartStates: JSON.stringify(stepStartStates) },
    'Step start states',
  );
  return Promise.resolve(stepStartStates);
}
