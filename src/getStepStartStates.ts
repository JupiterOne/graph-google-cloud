import {
  IntegrationExecutionContext,
  IntegrationLogger,
  IntegrationValidationError,
  StepStartState,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import { ServiceUsageName } from './google-cloud/types';
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
} from './steps/big-query';
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
import * as enablement from './steps/enablement';
import {
  STEP_CLOUD_FUNCTIONS,
  STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS,
  STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS,
} from './steps/functions';
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
import {
  STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS,
  STEP_PRIVATE_CA_CERTIFICATES,
  STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
} from './steps/privateca/constants';
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
import { StorageStepsSpec } from './steps/storage/constants';
import { IntegrationConfig, SerializedIntegrationConfig } from './types';
import { deserializeIntegrationConfig } from './utils/integrationConfig';
import { isMasterOrganizationInstance } from './utils/isMasterOrganizationInstance';
import { isSingleProjectInstance } from './utils/isSingleProjectInstance';

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
      useEnablementsInGetStepStartStates:
        config.useEnablementsForStepStartStates,
    },
    'Calculating step start states',
  );

  if (config.useEnablementsForStepStartStates) {
    return getStepStartStatesUsingServiceEnablements({
      masterOrgInstance,
      singleProjectInstance,
      organizationSteps,
      config,
      logger,
    });
  } else {
    return getDefaultStepStartStates({
      masterOrgInstance,
      singleProjectInstance,
      organizationSteps,
      config,
      logger,
    });
  }
}

function getDefaultStepStartStates(params: {
  masterOrgInstance: boolean | undefined;
  singleProjectInstance: boolean;
  organizationSteps: StepStartState;
  config: IntegrationConfig;
  logger: IntegrationLogger;
}) {
  const {
    masterOrgInstance,
    singleProjectInstance,
    organizationSteps,
    config,
    logger,
  } = params;

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
    [STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS]: { disabled: false },
    [STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS]: { disabled: false },
    [StorageStepsSpec.FETCH_STORAGE_BUCKETS.id]: { disabled: false },
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
    [SecretManagerSteps.FETCH_SECRETS.id]: { disabled: false },
    [SecretManagerSteps.FETCH_SECRET_VERSIONS.id]: { disabled: false },
    [CloudBuildStepsSpec.FETCH_BUILDS.id]: { disabled: false },
    [CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS.id]: { disabled: false },
    [CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS.id]: { disabled: false },
    [CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG.id]: {
      disabled: false,
    },
    [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG.id]: {
      disabled: false,
    },
    [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id]: {
      disabled: false,
    },
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS
      .id]: {
      disabled: false,
    },
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS
      .id]: {
      disabled: false,
    },
    [CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id]: {
      disabled: false,
    },
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS
      .id]: {
      disabled: false,
    },
    [CloudBuildStepsSpec
      .BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id]: {
      disabled: false,
    },
  };

  logger.info(
    { stepStartStates: JSON.stringify(stepStartStates) },
    'Step start states',
  );
  return Promise.resolve(stepStartStates);
}

async function getStepStartStatesUsingServiceEnablements(params: {
  masterOrgInstance: boolean | undefined;
  singleProjectInstance: boolean;
  organizationSteps: StepStartState;
  config: IntegrationConfig;
  logger: IntegrationLogger;
}) {
  const {
    masterOrgInstance,
    singleProjectInstance,
    organizationSteps,
    config,
    logger,
  } = params;

  let enabledServiceNames: string[];
  let serviceAccountProjectEnabledServiceNames: string[];
  try {
    const enabledServiceData = await enablement.getEnabledServiceNames(config);
    enabledServiceNames = enabledServiceData.intersectedEnabledServices ?? [];
    serviceAccountProjectEnabledServiceNames =
      enabledServiceData.mainProjectEnabledServices ?? [];
  } catch (err) {
    // NOTE: The `IntegrationValidationError` function does not currently support
    // a `cause` to be passed. We should update that.
    logger.warn({ err }, 'Error listing enabled service names');

    throw new IntegrationValidationError(
      `Failed to fetch enabled service names. Ability to list services is required to run the Google Cloud integration. (error=${err.message})`,
    );
  }

  logger.info({ enabledServiceNames }, 'Services enabled for project');
  logger.info(
    {
      mainProjectEnabledServiceNames: serviceAccountProjectEnabledServiceNames,
    },
    'Services enabled for the main project',
  );

  interface createStepStartStateParams {
    stepId: string;
    primaryServiceName: ServiceUsageName;
    additionalServiceNames?: ServiceUsageName[];
  }

  /**
   * Used to get the `google_iam_binding` and `google_iam_role` steps to run based on the service
   * account's home project's (config.serviceAccountKeyConfig.project_id) API enablement instead
   * of the API enablement of the project that is currently being ingested (config.projectId).
   * This was done in order to maintain functionality for existing customers who have not enabled
   * the Cloud Asset API in all their individual Google Cloud Projects, but have in the project
   * that their service account lives.
   *
   * This likely should be removed once users have enabled the Cloud Asset and IAM APIs in all of
   * their Google Cloud projects.
   */
  function createStartStatesBasedOnServiceAccountProject({
    stepId,
    primaryServiceName,
    additionalServiceNames
  }: createStepStartStateParams): StepStartState {
    return enablement.createStepStartStateWhereAllServicesMustBeEnabled({
      stepId,
      enabledServiceNames: serviceAccountProjectEnabledServiceNames, // using mainProjectEnabledServiceNames instead of enabledServiceNames
      primaryServiceName,
      additionalServiceNames,
    });
  }

  const createStepStartState = ({
    stepId,
    primaryServiceName,
    additionalServiceNames
  }: createStepStartStateParams): StepStartState => {
    return enablement.createStepStartState({
      stepId,
      enabledServiceNames,
      primaryServiceName,
      ...additionalServiceNames,
    });
  };

  function createOrgStepStartState({
    stepId,
    primaryServiceName,
    additionalServiceNames
  }: createStepStartStateParams): StepStartState {
    return {
      disabled:
        singleProjectInstance ||
        createStepStartState({ stepId, primaryServiceName, additionalServiceNames })
          .disabled,
    };
  }

  const stepStartStates: StepStartStates = {
    // Organization-required steps
    ...makeStepStartStates([...getOrganizationSteps()], organizationSteps),
    [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: createOrgStepStartState({
      stepId: STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
      primaryServiceName: ServiceUsageName.ACCESS_CONTEXT_MANAGER,
    }),
    [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: createOrgStepStartState({
      stepId: STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
      primaryServiceName: ServiceUsageName.ACCESS_CONTEXT_MANAGER,
    }),
    [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: createOrgStepStartState({
      stepId: STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
      primaryServiceName: ServiceUsageName.ACCESS_CONTEXT_MANAGER,
    }),
    // Rest of steps...
    // This API will be enabled otherwise fetching services names above would fail
    [STEP_RESOURCE_MANAGER_PROJECT]: { disabled: false },
    [ServiceUsageStepIds.FETCH_API_SERVICES]: { disabled: false },
    [STEP_IAM_BINDINGS]: createStartStatesBasedOnServiceAccountProject({
      stepId: STEP_IAM_BINDINGS,
      primaryServiceName: ServiceUsageName.CLOUD_ASSET,
      additionalServiceNames: [ServiceUsageName.IAM],
    }),
    [STEP_CREATE_BASIC_ROLES]: createStartStatesBasedOnServiceAccountProject({
      stepId: STEP_CREATE_BASIC_ROLES,
      primaryServiceName: ServiceUsageName.CLOUD_ASSET,
      additionalServiceNames: [ServiceUsageName.IAM],
    }),
    [STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject({
        stepId: STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.CLOUD_ASSET,
        additionalServiceNames: [ServiceUsageName.IAM],
      }),
    [STEP_CREATE_BINDING_ROLE_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject({
        stepId: STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.CLOUD_ASSET,
        additionalServiceNames: [ServiceUsageName.IAM],
      }),
    [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject({
        stepId: STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.CLOUD_ASSET,
        additionalServiceNames: [ServiceUsageName.IAM],
      }),
    [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject({
        stepId: STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.CLOUD_ASSET,
        additionalServiceNames: [ServiceUsageName.IAM],
      }),
    [STEP_CLOUD_FUNCTIONS]: createStepStartState({
      stepId: STEP_CLOUD_FUNCTIONS,
      primaryServiceName: ServiceUsageName.CLOUD_FUNCTIONS,
    }),
    [STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.CLOUD_FUNCTIONS,
    }),
    [STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.CLOUD_FUNCTIONS,
    }),
    [STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.CLOUD_FUNCTIONS,
    }),
    [StorageStepsSpec.FETCH_STORAGE_BUCKETS.id]: createStepStartState({
      stepId: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      primaryServiceName: ServiceUsageName.STORAGE,
      additionalServiceNames: [ServiceUsageName.STORAGE_COMPONENT, ServiceUsageName.STORAGE_API]
    }),
    [STEP_IAM_CUSTOM_ROLES]: createStartStatesBasedOnServiceAccountProject({
      stepId: STEP_IAM_CUSTOM_ROLES,
      primaryServiceName: ServiceUsageName.IAM,
    }),
    [STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject({
        stepId: STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.IAM
      }),
    [STEP_IAM_MANAGED_ROLES]: createStartStatesBasedOnServiceAccountProject({
      stepId: STEP_IAM_MANAGED_ROLES,
      primaryServiceName: ServiceUsageName.IAM,
    }),
    [STEP_IAM_SERVICE_ACCOUNTS]: createStepStartState({
      stepId: STEP_IAM_SERVICE_ACCOUNTS,
      primaryServiceName: ServiceUsageName.IAM
    }),
    [STEP_AUDIT_CONFIG_IAM_POLICY]: config.configureOrganizationProjects
      ? { disabled: true }
      : createStepStartState({
        stepId: STEP_AUDIT_CONFIG_IAM_POLICY,
        primaryServiceName: ServiceUsageName.RESOURCE_MANAGER
      }),
    [STEP_COMPUTE_DISKS]: createStepStartState({
      stepId: STEP_COMPUTE_DISKS,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_REGION_DISKS]: createStepStartState({
      stepId: STEP_COMPUTE_REGION_DISKS,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_IMAGES]: createStepStartState({
      stepId: STEP_COMPUTE_IMAGES,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_DISK_KMS_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_SNAPSHOTS]: createStepStartState({
      stepId: STEP_COMPUTE_SNAPSHOTS,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_NETWORKS]: createStepStartState({
      stepId: STEP_COMPUTE_NETWORKS,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_ADDRESSES]: createStepStartState({
      stepId: STEP_COMPUTE_ADDRESSES,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_GLOBAL_ADDRESSES]: createStepStartState({
      stepId: STEP_COMPUTE_GLOBAL_ADDRESSES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_FORWARDING_RULES]: createStepStartState({
      stepId: STEP_COMPUTE_FORWARDING_RULES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_GLOBAL_FORWARDING_RULES]: createStepStartState({
      stepId: STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_FIREWALLS]: createStepStartState({
      stepId: STEP_COMPUTE_FIREWALLS,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_SUBNETWORKS]: createStepStartState({
      stepId: STEP_COMPUTE_SUBNETWORKS,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_PROJECT]: createStepStartState({
      stepId: STEP_COMPUTE_PROJECT,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_HEALTH_CHECKS]: createStepStartState({
      stepId: STEP_COMPUTE_HEALTH_CHECKS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_REGION_HEALTH_CHECKS]: createStepStartState({
      stepId: STEP_COMPUTE_REGION_HEALTH_CHECKS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_INSTANCES]: createStepStartState({
      stepId: STEP_COMPUTE_INSTANCES,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_INSTANCE_GROUPS]: createStepStartState({
      stepId: STEP_COMPUTE_INSTANCE_GROUPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_REGION_INSTANCE_GROUPS]: createStepStartState({
      stepId: STEP_COMPUTE_REGION_INSTANCE_GROUPS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_LOADBALANCERS]: createStepStartState({
      stepId: STEP_COMPUTE_LOADBALANCERS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_REGION_LOADBALANCERS]: createStepStartState({
      stepId: STEP_COMPUTE_REGION_LOADBALANCERS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_BACKEND_SERVICES]: createStepStartState({
      stepId: STEP_COMPUTE_BACKEND_SERVICES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_REGION_BACKEND_SERVICES]: createStepStartState({
      stepId: STEP_COMPUTE_REGION_BACKEND_SERVICES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_BACKEND_BUCKETS]: createStepStartState({
      stepId: STEP_COMPUTE_BACKEND_BUCKETS,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS]:
      createStepStartState({
        stepId: STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.COMPUTE
      }),
    [STEP_COMPUTE_TARGET_SSL_PROXIES]: createStepStartState({
      stepId: STEP_COMPUTE_TARGET_SSL_PROXIES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_TARGET_HTTPS_PROXIES]: createStepStartState({
      stepId: STEP_COMPUTE_TARGET_HTTPS_PROXIES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES]: createStepStartState({
      stepId: STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_TARGET_HTTP_PROXIES]: createStepStartState({
      stepId: STEP_COMPUTE_TARGET_HTTP_PROXIES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES]: createStepStartState({
      stepId: STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
      primaryServiceName: ServiceUsageName.COMPUTE,
    }),
    [STEP_COMPUTE_SSL_POLICIES]: createStepStartState({
      stepId: STEP_COMPUTE_SSL_POLICIES,
      primaryServiceName: ServiceUsageName.COMPUTE
    }),
    [STEP_CLOUD_KMS_KEY_RINGS]: createStepStartState({
      stepId: STEP_CLOUD_KMS_KEY_RINGS,
      primaryServiceName: ServiceUsageName.KMS
    }),
    [STEP_CLOUD_KMS_KEYS]: createStepStartState({
      stepId: STEP_CLOUD_KMS_KEYS,
      primaryServiceName: ServiceUsageName.KMS
    }),
    [STEP_BIG_QUERY_DATASETS]: createStepStartState({
      stepId: STEP_BIG_QUERY_DATASETS,
      primaryServiceName: ServiceUsageName.BIG_QUERY
    }),
    [STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.BIG_QUERY,
    }),
    [STEP_BIG_QUERY_MODELS]: createStepStartState({
      stepId: STEP_BIG_QUERY_MODELS,
      primaryServiceName: ServiceUsageName.BIG_QUERY
    }),
    [STEP_BIG_QUERY_TABLES]: createStepStartState({
      stepId: STEP_BIG_QUERY_TABLES,
      primaryServiceName: ServiceUsageName.BIG_QUERY
    }),
    [STEP_SQL_ADMIN_INSTANCES]: createStepStartState({
      stepId: STEP_SQL_ADMIN_INSTANCES,
      primaryServiceName: ServiceUsageName.SQL_ADMIN,
    }),
    [SqlAdminSteps.BUILD_SQL_INSTANCE_KMS_KEY_RELATIONSHIPS]:
      createStepStartState({
        stepId: SqlAdminSteps.BUILD_SQL_INSTANCE_KMS_KEY_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.SQL_ADMIN,
        additionalServiceNames: [ServiceUsageName.KMS]
      }),
    [STEP_DNS_MANAGED_ZONES]: createStepStartState({
      stepId: STEP_DNS_MANAGED_ZONES,
      primaryServiceName: ServiceUsageName.DNS
    }),
    [STEP_DNS_POLICIES]: createStepStartState({
      stepId: STEP_DNS_POLICIES,
      primaryServiceName: ServiceUsageName.DNS
    }),
    [STEP_CONTAINER_CLUSTERS]: createStepStartState({
      stepId: STEP_CONTAINER_CLUSTERS,
      primaryServiceName: ServiceUsageName.CONTAINER
    }),
    [STEP_LOGGING_PROJECT_SINKS]: createStepStartState({
      stepId: STEP_LOGGING_PROJECT_SINKS,
      primaryServiceName: ServiceUsageName.LOGGING,
    }),
    [STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS]:
      createStepStartState({
        stepId: STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.LOGGING
      }),
    [STEP_LOGGING_METRICS]: createStepStartState({
      stepId: STEP_LOGGING_METRICS,
      primaryServiceName: ServiceUsageName.LOGGING
    }),
    [STEP_MONITORING_ALERT_POLICIES]: createStepStartState({
      stepId: STEP_MONITORING_ALERT_POLICIES,
      primaryServiceName: ServiceUsageName.MONITORING,
    }),
    [STEP_BINARY_AUTHORIZATION_POLICY]: createStepStartState({
      stepId: STEP_BINARY_AUTHORIZATION_POLICY,
      primaryServiceName: ServiceUsageName.BINARY_AUTHORIZATION,
    }),
    [STEP_PUBSUB_TOPICS]: createStepStartState({
      stepId: STEP_PUBSUB_TOPICS,
      primaryServiceName: ServiceUsageName.PUB_SUB
    }),
    [STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.PUB_SUB,
    }),
    [STEP_PUBSUB_SUBSCRIPTIONS]: createStepStartState({
      stepId: STEP_PUBSUB_SUBSCRIPTIONS,
      primaryServiceName: ServiceUsageName.PUB_SUB
    }),
    [STEP_APP_ENGINE_APPLICATION]: createStepStartState({
      stepId: STEP_APP_ENGINE_APPLICATION,
      primaryServiceName: ServiceUsageName.APP_ENGINE,
    }),
    [STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS]: createOrgStepStartState({
      stepId: STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.APP_ENGINE,
    }),
    [STEP_APP_ENGINE_SERVICES]: createStepStartState({
      stepId: STEP_APP_ENGINE_SERVICES,
      primaryServiceName: ServiceUsageName.APP_ENGINE,
    }),
    [STEP_APP_ENGINE_VERSIONS]: createStepStartState({
      stepId: STEP_APP_ENGINE_VERSIONS,
      primaryServiceName: ServiceUsageName.APP_ENGINE,
    }),
    [STEP_APP_ENGINE_INSTANCES]: createStepStartState({
      stepId: STEP_APP_ENGINE_INSTANCES,
      primaryServiceName: ServiceUsageName.APP_ENGINE,
    }),
    [STEP_CLOUD_RUN_SERVICES]: createStepStartState({
      stepId: STEP_CLOUD_RUN_SERVICES,
      primaryServiceName: ServiceUsageName.CLOUD_RUN
    }),
    [STEP_CLOUD_RUN_ROUTES]: createStepStartState({
      stepId: STEP_CLOUD_RUN_ROUTES,
      primaryServiceName: ServiceUsageName.CLOUD_RUN
    }),
    [STEP_CLOUD_RUN_CONFIGURATIONS]: createStepStartState({
      stepId: STEP_CLOUD_RUN_CONFIGURATIONS,
      primaryServiceName: ServiceUsageName.CLOUD_RUN,
    }),
    [STEP_REDIS_INSTANCES]: createStepStartState({
      stepId: STEP_REDIS_INSTANCES,
      primaryServiceName: ServiceUsageName.REDIS
    }),
    [STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.REDIS,
    }),
    [STEP_MEMCACHE_INSTANCES]: createStepStartState({
      stepId: STEP_MEMCACHE_INSTANCES,
      primaryServiceName: ServiceUsageName.MEMCACHE
    }),
    [STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.MEMCACHE,
    }),
    [STEP_SPANNER_INSTANCES]: createStepStartState({
      stepId: STEP_SPANNER_INSTANCES,
      primaryServiceName: ServiceUsageName.SPANNER
    }),
    [STEP_SPANNER_INSTANCE_CONFIGS]: createStepStartState({
      stepId: STEP_SPANNER_INSTANCE_CONFIGS,
      primaryServiceName: ServiceUsageName.SPANNER,
    }),
    [STEP_SPANNER_INSTANCE_DATABASES]: createStepStartState({
      stepId: STEP_SPANNER_INSTANCE_DATABASES,
      primaryServiceName: ServiceUsageName.SPANNER,
    }),
    [STEP_API_GATEWAY_APIS]: createStepStartState({
      stepId: STEP_API_GATEWAY_APIS,
      primaryServiceName: ServiceUsageName.API_GATEWAY
    }),
    [STEP_API_GATEWAY_API_CONFIGS]: createStepStartState({
      stepId: STEP_API_GATEWAY_API_CONFIGS,
      primaryServiceName: ServiceUsageName.API_GATEWAY,
    }),
    [STEP_API_GATEWAY_GATEWAYS]: createStepStartState({
      stepId: STEP_API_GATEWAY_GATEWAYS,
      primaryServiceName: ServiceUsageName.API_GATEWAY,
    }),
    [STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES]: createStepStartState({
      stepId: STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
      primaryServiceName: ServiceUsageName.PRIVATE_CA,
    }),
    [STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS]:
      createStepStartState({
        stepId: STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS,
        primaryServiceName: ServiceUsageName.PRIVATE_CA
      }),
    [STEP_PRIVATE_CA_CERTIFICATES]: createStepStartState({
      stepId: STEP_PRIVATE_CA_CERTIFICATES,
      primaryServiceName: ServiceUsageName.PRIVATE_CA,
    }),
    [STEP_DATAPROC_CLUSTERS]: createStepStartState({
      stepId: STEP_DATAPROC_CLUSTERS,
      primaryServiceName: ServiceUsageName.DATAPROC_CLUSTERS,
    }),
    [STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.DATAPROC_CLUSTERS,
    }),
    [STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.DATAPROC_CLUSTERS,
    }),
    [STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS]: createStepStartState({
      stepId: STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS,
      primaryServiceName: ServiceUsageName.DATAPROC_CLUSTERS,
    }),
    [STEP_BIG_TABLE_INSTANCES]: createStepStartState({
      stepId: STEP_BIG_TABLE_INSTANCES,
      primaryServiceName: ServiceUsageName.BIG_TABLE,
    }),
    [STEP_BIG_TABLE_APP_PROFILES]: createStepStartState({
      stepId: STEP_BIG_TABLE_APP_PROFILES,
      primaryServiceName: ServiceUsageName.BIG_TABLE,
    }),
    [STEP_BIG_TABLE_CLUSTERS]: createStepStartState({
      stepId: STEP_BIG_TABLE_CLUSTERS,
      primaryServiceName: ServiceUsageName.BIG_TABLE
    }),
    [STEP_BIG_TABLE_BACKUPS]: createStepStartState({
      stepId: STEP_BIG_TABLE_BACKUPS,
      primaryServiceName: ServiceUsageName.BIG_TABLE
    }),
    [STEP_BIG_TABLE_TABLES]: createStepStartState({
      stepId: STEP_BIG_TABLE_TABLES,
      primaryServiceName: ServiceUsageName.BIG_TABLE
    }),
    [STEP_BILLING_BUDGETS]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState({
          stepId: STEP_BILLING_BUDGETS,
          primaryServiceName: ServiceUsageName.BILLING_BUDGET
        })
        : { disabled: true },
    [STEP_BUILD_ACCOUNT_BUDGET]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState({
          stepId: STEP_BUILD_ACCOUNT_BUDGET,
          primaryServiceName: ServiceUsageName.BILLING_BUDGET
        })
        : { disabled: true },
    [STEP_BUILD_PROJECT_BUDGET]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState({
          stepId: STEP_BUILD_PROJECT_BUDGET,
          primaryServiceName: ServiceUsageName.BILLING_BUDGET
        })
        : { disabled: true },
    [STEP_BILLING_ACCOUNTS]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState({
          stepId: STEP_BILLING_ACCOUNTS,
          primaryServiceName: ServiceUsageName.CLOUD_BILLING
        })
        : { disabled: true },
    [STEP_BUILD_ADDITIONAL_PROJECT_BUDGET]: masterOrgInstance
      ? createStepStartState({
        stepId: STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
        primaryServiceName: ServiceUsageName.BILLING_BUDGET
      })
      : { disabled: true },
    [SecretManagerSteps.FETCH_SECRETS.id]: createStepStartState({
      stepId: SecretManagerSteps.FETCH_SECRETS.id,
      primaryServiceName: ServiceUsageName.SECRET_MANAGER,
    }),
    [SecretManagerSteps.FETCH_SECRET_VERSIONS.id]: createStepStartState({
      stepId: SecretManagerSteps.FETCH_SECRET_VERSIONS.id,
      primaryServiceName: ServiceUsageName.SECRET_MANAGER,
    }),
    [CloudBuildStepsSpec.FETCH_BUILDS.id]: createStepStartState({
      stepId: CloudBuildStepsSpec.FETCH_BUILDS.id,
      primaryServiceName: ServiceUsageName.CLOUD_BUILD,
    }),
    [CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS.id]: createStepStartState({
      stepId: CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS.id,
      primaryServiceName: ServiceUsageName.CLOUD_BUILD,
    }),
    [CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS.id]: createStepStartState({
      stepId: CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS.id,
      primaryServiceName: ServiceUsageName.CLOUD_BUILD,
    }),
    [CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG.id]:
      createStepStartState({
        stepId: CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG.id,
        primaryServiceName: ServiceUsageName.CLOUD_BUILD
      }),
    [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG.id]:
      createStepStartState({
        stepId: CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG.id,
        primaryServiceName: ServiceUsageName.CLOUD_BUILD
      }),
    [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id]: createStepStartState({
      stepId: CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id,
      primaryServiceName: ServiceUsageName.CLOUD_BUILD,
    }),
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS
      .id]: createStepStartState({
        stepId: CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS.id,
        primaryServiceName: ServiceUsageName.CLOUD_BUILD
      }),
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS.id]: createStepStartState({
      stepId: CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS.id,
      primaryServiceName: ServiceUsageName.CLOUD_BUILD,
      additionalServiceNames: [ServiceUsageName.STORAGE],
    }),
    [CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id]:
      createStepStartState({
        stepId: CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id,
        primaryServiceName: ServiceUsageName.CLOUD_SOURCE_REPOSITORIES
      }),
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS.id]: createStepStartState({
      stepId: CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS.id,
      primaryServiceName: ServiceUsageName.CLOUD_BUILD,
      additionalServiceNames: [ServiceUsageName.CLOUD_SOURCE_REPOSITORIES],
    }),
    [CloudBuildStepsSpec
      .BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id]:
      createStepStartState({
        stepId: CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id,
        primaryServiceName: ServiceUsageName.CLOUD_BUILD
      }),
  };

  logger.info(
    { stepStartStates: JSON.stringify(stepStartStates) },
    'Step start states',
  );

  const disabledServiceToStepMap = enablement.getDisabledServiceToStepMap();
  for (const service of Object.keys(disabledServiceToStepMap)) {
    logger.publishEvent({
      name: 'service_disabled',
      description: `The API Service ${service} is disabled in this account. As a result, the following steps are disabled: ${new Array(...disabledServiceToStepMap[service]).join(', ')}`,
    });
  }

  return stepStartStates;
}
