import {
  IntegrationExecutionContext,
  StepStartStates,
  IntegrationValidationError,
  StepStartState,
} from '@jupiterone/integration-sdk-core';
import { SerializedIntegrationConfig } from './types';
import { ServiceUsageName } from './google-cloud/types';
import {
  STEP_CLOUD_FUNCTIONS,
  STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS,
} from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';
import { STEP_API_SERVICES } from './steps/service-usage';
import { deserializeIntegrationConfig } from './utils/integrationConfig';
import {
  STEP_IAM_CUSTOM_ROLES,
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
} from './steps/compute';
import { STEP_CLOUD_KMS_KEYS, STEP_CLOUD_KMS_KEY_RINGS } from './steps/kms';
import {
  STEP_BIG_QUERY_DATASETS,
  STEP_BIG_QUERY_MODELS,
  STEP_BIG_QUERY_TABLES,
  STEP_BUILD_BIG_QUERY_DATASET_KMS_RELATIONSHIPS,
} from './steps/big-query';
import { STEP_SQL_ADMIN_INSTANCES } from './steps/sql-admin';
import {
  STEP_DNS_MANAGED_ZONES,
  STEP_DNS_POLICIES,
} from './steps/dns/constants';
import { STEP_CONTAINER_CLUSTERS } from './steps/containers';
import {
  STEP_LOGGING_METRICS,
  STEP_LOGGING_PROJECT_SINKS,
} from './steps/logging/constants';
import { STEP_MONITORING_ALERT_POLICIES } from './steps/monitoring/constants';
import { STEP_BINARY_AUTHORIZATION_POLICY } from './steps/binary-authorization/constants';
import {
  STEP_PUBSUB_SUBSCRIPTIONS,
  STEP_PUBSUB_TOPICS,
} from './steps/pub-sub/constants';
import {
  STEP_APP_ENGINE_APPLICATION,
  STEP_APP_ENGINE_INSTANCES,
  STEP_APP_ENGINE_SERVICES,
  STEP_APP_ENGINE_VERSIONS,
} from './steps/app-engine/constants';
import {
  STEP_CLOUD_RUN_CONFIGURATIONS,
  STEP_CLOUD_RUN_ROUTES,
  STEP_CLOUD_RUN_SERVICES,
} from './steps/cloud-run/constants';
import { STEP_REDIS_INSTANCES } from './steps/redis/constants';
import { STEP_MEMCACHE_INSTANCES } from './steps/memcache/constants';
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
  STEP_PRIVATE_CA_CERTIFICATES,
  STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
} from './steps/privateca/constants';
import * as enablement from './steps/enablement';
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

function validateInvocationConfig(
  context: IntegrationExecutionContext<SerializedIntegrationConfig>,
) {
  const { instance } = context;
  const { config } = instance;

  if (!config.serviceAccountKeyFile) {
    throw new IntegrationValidationError(
      'Missing a required integration config value {serviceAccountKeyFile}',
    );
  }
}

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
  context: IntegrationExecutionContext<SerializedIntegrationConfig>,
): Promise<StepStartStates> {
  const { instance, logger } = context;
  const { config: serializedIntegrationConfig } = instance;

  validateInvocationConfig(context);

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
    [STEP_API_SERVICES]: { disabled: false },
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
    [STEP_CLOUD_STORAGE_BUCKETS]: createStepStartState(
      ServiceUsageName.STORAGE,
      ServiceUsageName.STORAGE_COMPONENT,
      ServiceUsageName.STORAGE_API,
    ),
    [STEP_IAM_CUSTOM_ROLES]: createStartStatesBasedOnServiceAccountProject(
      ServiceUsageName.IAM,
    ),
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
    [STEP_DNS_MANAGED_ZONES]: createStepStartState(ServiceUsageName.DNS),
    [STEP_DNS_POLICIES]: createStepStartState(ServiceUsageName.DNS),
    [STEP_CONTAINER_CLUSTERS]: createStepStartState(ServiceUsageName.CONTAINER),
    [STEP_LOGGING_PROJECT_SINKS]: createStepStartState(
      ServiceUsageName.LOGGING,
    ),
    [STEP_LOGGING_METRICS]: createStepStartState(ServiceUsageName.LOGGING),
    [STEP_MONITORING_ALERT_POLICIES]: createStepStartState(
      ServiceUsageName.MONITORING,
    ),
    [STEP_BINARY_AUTHORIZATION_POLICY]: createStepStartState(
      ServiceUsageName.BINARY_AUTHORIZATION,
    ),
    [STEP_PUBSUB_TOPICS]: createStepStartState(ServiceUsageName.PUB_SUB),
    [STEP_PUBSUB_SUBSCRIPTIONS]: createStepStartState(ServiceUsageName.PUB_SUB),
    [STEP_APP_ENGINE_APPLICATION]: createStepStartState(
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
    [STEP_MEMCACHE_INSTANCES]: createStepStartState(ServiceUsageName.MEMCACHE),
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
    [STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES]: createStepStartState(
      ServiceUsageName.PRIVATE_CA,
    ),
    [STEP_PRIVATE_CA_CERTIFICATES]: createStepStartState(
      ServiceUsageName.PRIVATE_CA,
    ),
    [STEP_DATAPROC_CLUSTERS]: createStepStartState(
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
  };

  logger.info(
    { stepStartStates: JSON.stringify(stepStartStates) },
    'Step start states',
  );
  return stepStartStates;
}
