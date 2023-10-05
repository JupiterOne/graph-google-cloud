import {
  IntegrationExecutionContext,
  IntegrationLogger,
  IntegrationValidationError,
  IntegrationWarnEventName,
  StepStartState,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import { ServiceUsageName } from './google-cloud/types';
import { accessPoliciesSteps } from './steps/access-context-manager';
import {
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
  STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
} from './steps/access-context-manager/constants';
import { apiGatewaySteps } from './steps/api-gateway';
import {
  STEP_API_GATEWAY_API_CONFIGS,
  STEP_API_GATEWAY_APIS,
  STEP_API_GATEWAY_GATEWAYS,
} from './steps/api-gateway/constants';
import { appEngineSteps } from './steps/app-engine';
import {
  STEP_APP_ENGINE_APPLICATION,
  STEP_APP_ENGINE_INSTANCES,
  STEP_APP_ENGINE_SERVICES,
  STEP_APP_ENGINE_VERSIONS,
  STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS,
} from './steps/app-engine/constants';
import {
  bigQuerySteps,
  STEP_BIG_QUERY_DATASETS,
  STEP_BIG_QUERY_MODELS,
  STEP_BIG_QUERY_TABLES,
  STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS,
} from './steps/big-query';
import { bigTableSteps } from './steps/big-table';
import {
  STEP_BIG_TABLE_APP_PROFILES,
  STEP_BIG_TABLE_BACKUPS,
  STEP_BIG_TABLE_CLUSTERS,
  STEP_BIG_TABLE_INSTANCES,
  STEP_BIG_TABLE_TABLES,
} from './steps/big-table/constants';
import { billingBudgetsSteps } from './steps/billing-budgets';
import {
  STEP_BILLING_BUDGETS,
  STEP_BUILD_ACCOUNT_BUDGET,
  STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
  STEP_BUILD_PROJECT_BUDGET,
} from './steps/billing-budgets/constants';
import { binaryAuthorizationSteps } from './steps/binary-authorization';
import { STEP_BINARY_AUTHORIZATION_POLICY } from './steps/binary-authorization/constants';
import { cloudAssetSteps } from './steps/cloud-asset';
import {
  STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BASIC_ROLES,
  STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS,
  STEP_CREATE_BINDING_ROLE_RELATIONSHIPS,
  STEP_IAM_BINDINGS,
} from './steps/cloud-asset/constants';
import { cloudBillingSteps } from './steps/cloud-billing';
import { STEP_BILLING_ACCOUNTS } from './steps/cloud-billing/constants';
import { cloudBuildSteps } from './steps/cloud-build';
import { CloudBuildStepsSpec } from './steps/cloud-build/constants';
import { cloudRunSteps } from './steps/cloud-run';
import {
  STEP_CLOUD_RUN_CONFIGURATIONS,
  STEP_CLOUD_RUN_ROUTES,
  STEP_CLOUD_RUN_SERVICES,
} from './steps/cloud-run/constants';
import { cloudSourceRepositoriesSteps } from './steps/cloud-source-repositories';
import { CloudSourceRepositoriesStepsSpec } from './steps/cloud-source-repositories/constants';
import {
  computeSteps,
  STEP_COMPUTE_ADDRESSES,
  STEP_COMPUTE_BACKEND_BUCKETS,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_FIREWALLS,
  STEP_COMPUTE_FORWARDING_RULES,
  STEP_COMPUTE_GLOBAL_ADDRESSES,
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
  STEP_COMPUTE_HEALTH_CHECKS,
  STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
  STEP_COMPUTE_IMAGES,
  STEP_COMPUTE_INSTANCE_GROUPS,
  STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_LOADBALANCERS,
  STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
  STEP_COMPUTE_REGION_DISKS,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  STEP_COMPUTE_REGION_LOADBALANCERS,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
  STEP_COMPUTE_SNAPSHOTS,
  STEP_COMPUTE_SSL_POLICIES,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_TARGET_SSL_PROXIES,
  STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
} from './steps/compute';
import { containerSteps, STEP_CONTAINER_CLUSTERS } from './steps/containers';
import { dataprocSteps } from './steps/dataproc';
import {
  STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS,
  STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS,
  STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS,
  STEP_DATAPROC_CLUSTERS,
} from './steps/dataproc/constants';
import { dnsManagedZonesSteps } from './steps/dns';
import {
  STEP_DNS_MANAGED_ZONES,
  STEP_DNS_POLICIES,
} from './steps/dns/constants';
import * as enablement from './steps/enablement';
import {
  functionsSteps,
  STEP_CLOUD_FUNCTIONS,
  STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS,
  STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS,
} from './steps/functions';
import {
  iamSteps,
  STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS,
  STEP_IAM_CUSTOM_ROLES,
  STEP_IAM_MANAGED_ROLES,
  STEP_IAM_SERVICE_ACCOUNTS,
} from './steps/iam';
import {
  kmsSteps,
  STEP_CLOUD_KMS_KEY_RINGS,
  STEP_CLOUD_KMS_KEYS,
} from './steps/kms';
import { loggingSteps } from './steps/logging';
import {
  STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS,
  STEP_LOGGING_METRICS,
  STEP_LOGGING_PROJECT_SINKS,
} from './steps/logging/constants';
import { memcacheSteps } from './steps/memcache';
import {
  STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS,
  STEP_MEMCACHE_INSTANCES,
} from './steps/memcache/constants';
import { monitoringSteps } from './steps/monitoring';
import { STEP_MONITORING_ALERT_POLICIES } from './steps/monitoring/constants';
import { privateCaSteps } from './steps/privateca';
import { PrivatecaSteps } from './steps/privateca/constants';
import { pubSubSteps } from './steps/pub-sub';
import {
  STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS,
  STEP_PUBSUB_SUBSCRIPTIONS,
  STEP_PUBSUB_TOPICS,
} from './steps/pub-sub/constants';
import { redisSteps } from './steps/redis';
import {
  STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS,
  STEP_REDIS_INSTANCES,
} from './steps/redis/constants';
import {
  resourceManagerSteps,
  STEP_AUDIT_CONFIG_IAM_POLICY,
  STEP_RESOURCE_MANAGER_FOLDERS,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
  STEP_RESOURCE_MANAGER_ORGANIZATION,
  STEP_RESOURCE_MANAGER_PROJECT,
} from './steps/resource-manager';
import { secretManagerSteps } from './steps/secret-manager';
import { SecretManagerSteps } from './steps/secret-manager/constants';
import { serviceUsageSteps } from './steps/service-usage';
import { ServiceUsageStepIds } from './steps/service-usage/constants';
import { spannerSteps } from './steps/spanner';
import {
  STEP_SPANNER_INSTANCE_CONFIGS,
  STEP_SPANNER_INSTANCE_DATABASES,
  STEP_SPANNER_INSTANCES,
} from './steps/spanner/constants';
import {
  sqlAdminSteps,
  SqlAdminSteps,
  STEP_SQL_ADMIN_INSTANCES,
} from './steps/sql-admin';
import { storageSteps } from './steps/storage';
import { StorageStepsSpec } from './steps/storage/constants';
import { webSecurityScannerSteps } from './steps/web-security-scanner';
import { WebSecurityScannerSteps } from './steps/web-security-scanner/constants';
import { IntegrationConfig } from './types';
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

export default async function getStepStartStates(
  context: IntegrationExecutionContext<IntegrationConfig>,
): Promise<StepStartStates> {
  const { instance, logger } = context;
  const { config } = instance;

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
    [PrivatecaSteps.STEP_PRIVATE_CA_POOLS.id]: { disabled: false },
    [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id]: {
      disabled: false,
    },
    [PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS.id]: {
      disabled: false,
    },
    [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATES.id]: { disabled: false },
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
    [WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id]: {
      disabled: false,
    },
    [WebSecurityScannerSteps.FETCH_SCAN_RUNS.id]: {
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
    const enabledServiceData = await enablement.getEnabledServiceNames(
      config,
      logger,
    );
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
  function createStartStatesBasedOnServiceAccountProject(
    primaryServiceName: ServiceUsageName,
    ...additionalServiceNames: ServiceUsageName[]
  ): StepStartState {
    return enablement.createStepStartStateWhereAllServicesMustBeEnabled(
      serviceAccountProjectEnabledServiceNames, // using mainProjectEnabledServiceNames instead of enabledServiceNames
      primaryServiceName,
      ...additionalServiceNames,
    );
  }

  const createStepStartState = (
    primaryServiceName: ServiceUsageName,
    ...additionalServiceNames: ServiceUsageName[]
  ): StepStartState => {
    return enablement.createStepStartState(
      enabledServiceNames,
      primaryServiceName,
      ...additionalServiceNames,
    );
  };

  function createOrgStepStartState(
    primaryServiceName: ServiceUsageName,
    ...additionalServiceNames: ServiceUsageName[]
  ): StepStartState {
    return {
      disabled:
        singleProjectInstance ||
        createStepStartState(primaryServiceName, ...additionalServiceNames)
          .disabled,
    };
  }

  const stepStartStates: StepStartStates = {
    // Organization-required steps
    ...makeStepStartStates([...getOrganizationSteps()], organizationSteps),
    [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: createOrgStepStartState(
      ServiceUsageName.ACCESS_CONTEXT_MANAGER,
    ),
    [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: createOrgStepStartState(
      ServiceUsageName.ACCESS_CONTEXT_MANAGER,
    ),
    [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: createOrgStepStartState(
      ServiceUsageName.ACCESS_CONTEXT_MANAGER,
    ),
    // Rest of steps...
    // This API will be enabled otherwise fetching services names above would fail
    [STEP_RESOURCE_MANAGER_PROJECT]: { disabled: false },
    [ServiceUsageStepIds.FETCH_API_SERVICES]: { disabled: false },
    [STEP_IAM_BINDINGS]: createStartStatesBasedOnServiceAccountProject(
      ServiceUsageName.CLOUD_ASSET,
      ServiceUsageName.IAM,
    ),
    [STEP_CREATE_BASIC_ROLES]: createStartStatesBasedOnServiceAccountProject(
      ServiceUsageName.CLOUD_ASSET,
      ServiceUsageName.IAM,
    ),
    [STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject(
        ServiceUsageName.CLOUD_ASSET,
        ServiceUsageName.IAM,
      ),
    [STEP_CREATE_BINDING_ROLE_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject(
        ServiceUsageName.CLOUD_ASSET,
        ServiceUsageName.IAM,
      ),
    [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject(
        ServiceUsageName.CLOUD_ASSET,
        ServiceUsageName.IAM,
      ),
    [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject(
        ServiceUsageName.CLOUD_ASSET,
        ServiceUsageName.IAM,
      ),
    [STEP_CLOUD_FUNCTIONS]: createStepStartState(
      ServiceUsageName.CLOUD_FUNCTIONS,
    ),
    [STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.CLOUD_FUNCTIONS,
    ),
    [STEP_CLOUD_FUNCTIONS_SOURCE_REPO_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.CLOUD_FUNCTIONS,
    ),
    [STEP_CLOUD_FUNCTIONS_STORAGE_BUCKET_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.CLOUD_FUNCTIONS,
    ),
    [StorageStepsSpec.FETCH_STORAGE_BUCKETS.id]: createStepStartState(
      ServiceUsageName.STORAGE,
      ServiceUsageName.STORAGE_COMPONENT,
      ServiceUsageName.STORAGE_API,
    ),
    [STEP_IAM_CUSTOM_ROLES]: createStartStatesBasedOnServiceAccountProject(
      ServiceUsageName.IAM,
    ),
    [STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS]:
      createStartStatesBasedOnServiceAccountProject(ServiceUsageName.IAM),
    [STEP_IAM_MANAGED_ROLES]: createStartStatesBasedOnServiceAccountProject(
      ServiceUsageName.IAM,
    ),
    [STEP_IAM_SERVICE_ACCOUNTS]: createStepStartState(ServiceUsageName.IAM),
    [STEP_AUDIT_CONFIG_IAM_POLICY]: config.configureOrganizationProjects
      ? { disabled: true }
      : createStepStartState(ServiceUsageName.RESOURCE_MANAGER),
    [STEP_COMPUTE_DISKS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_REGION_DISKS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_IMAGES]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_DISK_KMS_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_SNAPSHOTS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_NETWORKS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_ADDRESSES]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_GLOBAL_ADDRESSES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_FORWARDING_RULES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_GLOBAL_FORWARDING_RULES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_FIREWALLS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_SUBNETWORKS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_PROJECT]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_HEALTH_CHECKS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_REGION_HEALTH_CHECKS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_INSTANCES]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_INSTANCE_GROUPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_REGION_INSTANCE_GROUPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_LOADBALANCERS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_REGION_LOADBALANCERS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_BACKEND_SERVICES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_REGION_BACKEND_SERVICES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_BACKEND_BUCKETS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS]:
      createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_TARGET_SSL_PROXIES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_TARGET_HTTPS_PROXIES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_TARGET_HTTP_PROXIES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_SSL_POLICIES]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_CLOUD_KMS_KEY_RINGS]: createStepStartState(ServiceUsageName.KMS),
    [STEP_CLOUD_KMS_KEYS]: createStepStartState(ServiceUsageName.KMS),
    [STEP_BIG_QUERY_DATASETS]: createStepStartState(ServiceUsageName.BIG_QUERY),
    [STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.BIG_QUERY,
    ),
    [STEP_BIG_QUERY_MODELS]: createStepStartState(ServiceUsageName.BIG_QUERY),
    [STEP_BIG_QUERY_TABLES]: createStepStartState(ServiceUsageName.BIG_QUERY),
    [STEP_SQL_ADMIN_INSTANCES]: createStepStartState(
      ServiceUsageName.SQL_ADMIN,
    ),
    [SqlAdminSteps.BUILD_SQL_INSTANCE_KMS_KEY_RELATIONSHIPS]:
      createStepStartState(ServiceUsageName.SQL_ADMIN, ServiceUsageName.KMS),
    [STEP_DNS_MANAGED_ZONES]: createStepStartState(ServiceUsageName.DNS),
    [STEP_DNS_POLICIES]: createStepStartState(ServiceUsageName.DNS),
    [STEP_CONTAINER_CLUSTERS]: createStepStartState(ServiceUsageName.CONTAINER),
    [STEP_LOGGING_PROJECT_SINKS]: createStepStartState(
      ServiceUsageName.LOGGING,
    ),
    [STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS]:
      createStepStartState(ServiceUsageName.LOGGING),
    [STEP_LOGGING_METRICS]: createStepStartState(ServiceUsageName.LOGGING),
    [STEP_MONITORING_ALERT_POLICIES]: createStepStartState(
      ServiceUsageName.MONITORING,
    ),
    [STEP_BINARY_AUTHORIZATION_POLICY]: createStepStartState(
      ServiceUsageName.BINARY_AUTHORIZATION,
    ),
    [STEP_PUBSUB_TOPICS]: createStepStartState(ServiceUsageName.PUB_SUB),
    [STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.PUB_SUB,
    ),
    [STEP_PUBSUB_SUBSCRIPTIONS]: createStepStartState(ServiceUsageName.PUB_SUB),
    [STEP_APP_ENGINE_APPLICATION]: createStepStartState(
      ServiceUsageName.APP_ENGINE,
    ),
    [STEP_CREATE_APP_ENGINE_BUCKET_RELATIONSHIPS]: createOrgStepStartState(
      ServiceUsageName.APP_ENGINE,
    ),
    [STEP_APP_ENGINE_SERVICES]: createStepStartState(
      ServiceUsageName.APP_ENGINE,
    ),
    [STEP_APP_ENGINE_VERSIONS]: createStepStartState(
      ServiceUsageName.APP_ENGINE,
    ),
    [STEP_APP_ENGINE_INSTANCES]: createStepStartState(
      ServiceUsageName.APP_ENGINE,
    ),
    [STEP_CLOUD_RUN_SERVICES]: createStepStartState(ServiceUsageName.CLOUD_RUN),
    [STEP_CLOUD_RUN_ROUTES]: createStepStartState(ServiceUsageName.CLOUD_RUN),
    [STEP_CLOUD_RUN_CONFIGURATIONS]: createStepStartState(
      ServiceUsageName.CLOUD_RUN,
    ),
    [STEP_REDIS_INSTANCES]: createStepStartState(ServiceUsageName.REDIS),
    [STEP_CREATE_REDIS_INSTANCE_NETWORK_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.REDIS,
    ),
    [STEP_MEMCACHE_INSTANCES]: createStepStartState(ServiceUsageName.MEMCACHE),
    [STEP_CREATE_MEMCACHE_INSTANCE_NETWORK_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.MEMCACHE,
    ),
    [STEP_SPANNER_INSTANCES]: createStepStartState(ServiceUsageName.SPANNER),
    [STEP_SPANNER_INSTANCE_CONFIGS]: createStepStartState(
      ServiceUsageName.SPANNER,
    ),
    [STEP_SPANNER_INSTANCE_DATABASES]: createStepStartState(
      ServiceUsageName.SPANNER,
    ),
    [STEP_API_GATEWAY_APIS]: createStepStartState(ServiceUsageName.API_GATEWAY),
    [STEP_API_GATEWAY_API_CONFIGS]: createStepStartState(
      ServiceUsageName.API_GATEWAY,
    ),
    [STEP_API_GATEWAY_GATEWAYS]: createStepStartState(
      ServiceUsageName.API_GATEWAY,
    ),
    [PrivatecaSteps.STEP_PRIVATE_CA_POOLS.id]: createStepStartState(
      ServiceUsageName.PRIVATE_CA,
    ),
    [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id]:
      createStepStartState(ServiceUsageName.PRIVATE_CA),
    [PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS.id]:
      createStepStartState(ServiceUsageName.PRIVATE_CA),
    [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATES.id]: createStepStartState(
      ServiceUsageName.PRIVATE_CA,
    ),
    [STEP_DATAPROC_CLUSTERS]: createStepStartState(
      ServiceUsageName.DATAPROC_CLUSTERS,
    ),
    [STEP_DATAPROC_CLUSTER_KMS_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.DATAPROC_CLUSTERS,
    ),
    [STEP_CREATE_CLUSTER_STORAGE_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.DATAPROC_CLUSTERS,
    ),
    [STEP_CREATE_CLUSTER_IMAGE_RELATIONSHIPS]: createStepStartState(
      ServiceUsageName.DATAPROC_CLUSTERS,
    ),
    [STEP_BIG_TABLE_INSTANCES]: createStepStartState(
      ServiceUsageName.BIG_TABLE,
    ),
    [STEP_BIG_TABLE_APP_PROFILES]: createStepStartState(
      ServiceUsageName.BIG_TABLE,
    ),
    [STEP_BIG_TABLE_CLUSTERS]: createStepStartState(ServiceUsageName.BIG_TABLE),
    [STEP_BIG_TABLE_BACKUPS]: createStepStartState(ServiceUsageName.BIG_TABLE),
    [STEP_BIG_TABLE_TABLES]: createStepStartState(ServiceUsageName.BIG_TABLE),
    [STEP_BILLING_BUDGETS]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState(ServiceUsageName.BILLING_BUDGET)
        : { disabled: true },
    [STEP_BUILD_ACCOUNT_BUDGET]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState(ServiceUsageName.BILLING_BUDGET)
        : { disabled: true },
    [STEP_BUILD_PROJECT_BUDGET]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState(ServiceUsageName.BILLING_BUDGET)
        : { disabled: true },
    [STEP_BILLING_ACCOUNTS]:
      singleProjectInstance || masterOrgInstance
        ? createStepStartState(ServiceUsageName.CLOUD_BILLING)
        : { disabled: true },
    [STEP_BUILD_ADDITIONAL_PROJECT_BUDGET]: masterOrgInstance
      ? createStepStartState(ServiceUsageName.BILLING_BUDGET)
      : { disabled: true },
    [SecretManagerSteps.FETCH_SECRETS.id]: createStepStartState(
      ServiceUsageName.SECRET_MANAGER,
    ),
    [SecretManagerSteps.FETCH_SECRET_VERSIONS.id]: createStepStartState(
      ServiceUsageName.SECRET_MANAGER,
    ),
    [CloudBuildStepsSpec.FETCH_BUILDS.id]: createStepStartState(
      ServiceUsageName.CLOUD_BUILD,
    ),
    [CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS.id]: createStepStartState(
      ServiceUsageName.CLOUD_BUILD,
    ),
    [CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS.id]: createStepStartState(
      ServiceUsageName.CLOUD_BUILD,
    ),
    [CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG.id]:
      createStepStartState(ServiceUsageName.CLOUD_BUILD),
    [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG.id]:
      createStepStartState(ServiceUsageName.CLOUD_BUILD),
    [CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id]: createStepStartState(
      ServiceUsageName.CLOUD_BUILD,
    ),
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_TRIGGER_TRIGGERS_BUILD_RELATIONSHIPS
      .id]: createStepStartState(ServiceUsageName.CLOUD_BUILD),
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_STORAGE_BUCKET_RELATIONSHIPS
      .id]: createStepStartState(
      ServiceUsageName.CLOUD_BUILD,
      ServiceUsageName.STORAGE,
    ),
    [CloudSourceRepositoriesStepsSpec.FETCH_REPOSITORIES.id]:
      createStepStartState(ServiceUsageName.CLOUD_SOURCE_REPOSITORIES),
    [CloudBuildStepsSpec.BUILD_CLOUD_BUILD_USES_SOURCE_REPOSITORY_RELATIONSHIPS
      .id]: createStepStartState(
      ServiceUsageName.CLOUD_BUILD,
      ServiceUsageName.CLOUD_SOURCE_REPOSITORIES,
    ),
    [CloudBuildStepsSpec
      .BUILD_CLOUD_BUILD_TRIGGER_USES_GITHUB_REPO_RELATIONSHIPS.id]:
      createStepStartState(ServiceUsageName.CLOUD_BUILD),
    [WebSecurityScannerSteps.FETCH_SCAN_CONFIGS.id]: createStepStartState(
      ServiceUsageName.WEB_SECURITY_SCANNER,
    ),
    [WebSecurityScannerSteps.FETCH_SCAN_RUNS.id]: createStepStartState(
      ServiceUsageName.WEB_SECURITY_SCANNER,
    ),
  };

  const apiServiceToStepIdsMap: { [apiService: string]: string[] } = {
    [ServiceUsageName.ACCESS_CONTEXT_MANAGER]: accessPoliciesSteps.map(
      (s) => s.id,
    ),
    [ServiceUsageName.API_GATEWAY]: apiGatewaySteps.map((s) => s.id),
    [ServiceUsageName.APP_ENGINE]: appEngineSteps.map((s) => s.id),
    [ServiceUsageName.BIG_QUERY]: bigQuerySteps.map((s) => s.id),
    [ServiceUsageName.BIG_TABLE]: bigTableSteps.map((s) => s.id),
    [ServiceUsageName.BILLING_BUDGET]: billingBudgetsSteps.map((s) => s.id),
    [ServiceUsageName.BINARY_AUTHORIZATION]: binaryAuthorizationSteps.map(
      (s) => s.id,
    ),
    [ServiceUsageName.CLOUD_ASSET]: cloudAssetSteps.map((s) => s.id),
    [ServiceUsageName.CLOUD_BILLING]: cloudBillingSteps.map((s) => s.id),
    [ServiceUsageName.CLOUD_BUILD]: cloudBuildSteps.map((s) => s.id),
    [ServiceUsageName.CLOUD_FUNCTIONS]: functionsSteps.map((s) => s.id),
    [ServiceUsageName.CLOUD_RUN]: cloudRunSteps.map((s) => s.id),
    [ServiceUsageName.CLOUD_SOURCE_REPOSITORIES]:
      cloudSourceRepositoriesSteps.map((s) => s.id),
    [ServiceUsageName.COMPUTE]: computeSteps.map((s) => s.id),
    [ServiceUsageName.CONTAINER]: containerSteps.map((s) => s.id),
    [ServiceUsageName.DATAPROC_CLUSTERS]: dataprocSteps.map((s) => s.id),
    [ServiceUsageName.DNS]: dnsManagedZonesSteps.map((s) => s.id),
    [ServiceUsageName.IAM]: iamSteps.map((s) => s.id),
    [ServiceUsageName.KMS]: kmsSteps.map((s) => s.id),
    [ServiceUsageName.LOGGING]: loggingSteps.map((s) => s.id),
    [ServiceUsageName.MEMCACHE]: memcacheSteps.map((s) => s.id),
    [ServiceUsageName.MONITORING]: monitoringSteps.map((s) => s.id),
    [ServiceUsageName.PRIVATE_CA]: privateCaSteps.map((s) => s.id),
    [ServiceUsageName.PUB_SUB]: pubSubSteps.map((s) => s.id),
    [ServiceUsageName.REDIS]: redisSteps.map((s) => s.id),
    [ServiceUsageName.RESOURCE_MANAGER]: resourceManagerSteps.map((s) => s.id),
    [ServiceUsageName.SECRET_MANAGER]: secretManagerSteps.map((s) => s.id),
    [ServiceUsageName.SERVICE_USAGE]: serviceUsageSteps.map((s) => s.id),
    [ServiceUsageName.SPANNER]: spannerSteps.map((s) => s.id),
    [ServiceUsageName.SQL_ADMIN]: sqlAdminSteps.map((s) => s.id),
    [ServiceUsageName.STORAGE]: storageSteps.map((s) => s.id),
    [ServiceUsageName.WEB_SECURITY_SCANNER]: webSecurityScannerSteps.map(
      (s) => s.id,
    ),
  };

  for (const serviceName of Object.keys(apiServiceToStepIdsMap)) {
    if (!enabledServiceNames.includes(serviceName)) {
      logger.publishWarnEvent({
        name: 'step_skip' as IntegrationWarnEventName,
        description: `The API Service ${serviceName} is disabled in this account. As a result, the following steps are disabled: ${apiServiceToStepIdsMap[serviceName]}`,
      });
    }
  }

  logger.info(
    { stepStartStates: JSON.stringify(stepStartStates) },
    'Step start states',
  );
  return stepStartStates;
}
