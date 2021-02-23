import {
  IntegrationExecutionContext,
  StepStartStates,
  IntegrationValidationError,
  StepStartState,
} from '@jupiterone/integration-sdk-core';
import { SerializedIntegrationConfig, IntegrationConfig } from './types';
import { ServiceUsageClient } from './steps/service-usage/client';
import { ServiceUsageName } from './google-cloud/types';
import { STEP_CLOUD_FUNCTIONS } from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';
import { STEP_API_SERVICES } from './steps/service-usage';
import { deserializeIntegrationConfig } from './utils/integrationConfig';
import { STEP_IAM_ROLES, STEP_IAM_SERVICE_ACCOUNTS } from './steps/iam';
import {
  STEP_RESOURCE_MANAGER_IAM_POLICY,
  STEP_PROJECT,
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
} from './steps/compute';
import { STEP_CLOUD_KMS_KEYS, STEP_CLOUD_KMS_KEY_RINGS } from './steps/kms';
import { STEP_BIG_QUERY_DATASETS } from './steps/big-query';
import { STEP_SQL_ADMIN_INSTANCES } from './steps/sql-admin';
import { STEP_DNS_MANAGED_ZONES } from './steps/dns/constants';
import { STEP_CONTAINER_CLUSTERS } from './steps/containers';
import {
  STEP_LOGGING_METRICS,
  STEP_LOGGING_PROJECT_SINKS,
} from './steps/logging/constants';
import { STEP_MONITORING_ALERT_POLICIES } from './steps/monitoring/constants';
import { STEP_BINARY_AUTHORIZATION_POLICY } from './steps/binary-authorization/constants';

async function getEnabledServiceNames(
  config: IntegrationConfig,
): Promise<string[]> {
  const client = new ServiceUsageClient({ config });
  const enabledServices = await client.collectEnabledServices();
  return enabledServices.map((v) => {
    // Each value looks like this: `projects/PROJ_ID_NUM/services/appengine.googleapis.com`
    const serviceParts = (v.name as string).split('/');
    return serviceParts[serviceParts.length - 1];
  });
}

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

  let enabledServiceNames: string[];

  try {
    enabledServiceNames = await getEnabledServiceNames(config);
  } catch (err) {
    // NOTE: The `IntegrationValidationError` function does not currently support
    // a `cause` to be passed. We should update that.
    logger.warn({ err }, 'Error listing enabled service names');

    throw new IntegrationValidationError(
      `Failed to fetch enabled service names. Ability to list services is required to run the Google Cloud integration. (error=${err.message})`,
    );
  }

  const createStepStartState = (
    serviceName: ServiceUsageName,
  ): StepStartState => {
    return {
      disabled: !enabledServiceNames.includes(serviceName),
    };
  };

  return {
    // This API will be enabled otherwise fetching services names above would fail
    [STEP_PROJECT]: { disabled: false },
    [STEP_API_SERVICES]: { disabled: false },
    [STEP_CLOUD_FUNCTIONS]: createStepStartState(
      ServiceUsageName.CLOUD_FUNCTIONS,
    ),
    [STEP_CLOUD_STORAGE_BUCKETS]: createStepStartState(
      ServiceUsageName.STORAGE,
    ),
    [STEP_IAM_ROLES]: createStepStartState(ServiceUsageName.IAM),
    [STEP_IAM_SERVICE_ACCOUNTS]: createStepStartState(ServiceUsageName.IAM),
    [STEP_RESOURCE_MANAGER_IAM_POLICY]: createStepStartState(
      ServiceUsageName.RESOURCE_MANAGER,
    ),
    [STEP_COMPUTE_DISKS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_NETWORKS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_FIREWALLS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_SUBNETWORKS]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_PROJECT]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_HEALTH_CHECKS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_INSTANCES]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_COMPUTE_INSTANCE_GROUPS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_LOADBALANCERS]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_BACKEND_SERVICES]: createStepStartState(
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
    [STEP_COMPUTE_TARGET_HTTP_PROXIES]: createStepStartState(
      ServiceUsageName.COMPUTE,
    ),
    [STEP_COMPUTE_SSL_POLICIES]: createStepStartState(ServiceUsageName.COMPUTE),
    [STEP_CLOUD_KMS_KEY_RINGS]: createStepStartState(ServiceUsageName.KMS),
    [STEP_CLOUD_KMS_KEYS]: createStepStartState(ServiceUsageName.KMS),
    [STEP_BIG_QUERY_DATASETS]: createStepStartState(ServiceUsageName.BIG_QUERY),
    [STEP_SQL_ADMIN_INSTANCES]: createStepStartState(
      ServiceUsageName.SQL_ADMIN,
    ),
    [STEP_DNS_MANAGED_ZONES]: createStepStartState(ServiceUsageName.DNS),
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
  };
}
