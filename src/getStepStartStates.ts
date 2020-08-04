import {
  IntegrationExecutionContext,
  StepStartStates,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { SerializedIntegrationConfig, IntegrationConfig } from './types';
import { ServiceUsageClient } from './steps/service-usage/client';
import { ServiceUsageName } from './google-cloud/types';
import { STEP_CLOUD_FUNCTIONS } from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';
import { STEP_API_SERVICES } from './steps/service-usage';
import { deserializeIntegrationConfig } from './utils/integrationConfig';

async function getEnabledServiceNames(
  config: IntegrationConfig,
): Promise<string[]> {
  const client = new ServiceUsageClient({ config });
  const enabledServices = await client.collectEnabledServices();
  return enabledServices.map((v) => v.name as string);
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

  return {
    [STEP_API_SERVICES]: {
      // This API will be enabled otherwise fetching services names above would fail
      disabled: false,
    },
    [STEP_CLOUD_FUNCTIONS]: {
      disabled: enabledServiceNames.includes(ServiceUsageName.CLOUD_FUNCTIONS),
    },
    [STEP_CLOUD_STORAGE_BUCKETS]: {
      disabled: enabledServiceNames.includes(ServiceUsageName.STORAGE),
    },
  };
}
