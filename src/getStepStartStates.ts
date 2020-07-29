import {
  IntegrationExecutionContext,
  StepStartStates,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './types';
import { ServiceUsageClient } from './steps/service-usage/client';
import { ServiceUsageName } from './google-cloud/types';
import { STEP_CLOUD_FUNCTIONS } from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';

async function getEnabledServiceNames(
  config: IntegrationConfig,
): Promise<string[]> {
  const client = new ServiceUsageClient({ config });
  const enabledServices = await client.collectEnabledServices();
  return enabledServices.map((v) => v.name as string);
}

function validateInvocationConfig(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { instance } = context;
  const { config } = instance;

  if (!config.clientEmail || !config.privateKey || !config.projectId) {
    throw new IntegrationValidationError(
      'Missing a required integration config value {clientEmail, privateKey, projectId}',
    );
  }
}

export default async function getStepStartStates(
  context: IntegrationExecutionContext<IntegrationConfig>,
): Promise<StepStartStates> {
  const { instance, logger } = context;
  const { config } = instance;

  validateInvocationConfig(context);
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
    [STEP_CLOUD_FUNCTIONS]: {
      disabled: enabledServiceNames.includes(ServiceUsageName.CLOUD_FUNCTIONS),
    },
    [STEP_CLOUD_STORAGE_BUCKETS]: {
      disabled: enabledServiceNames.includes(ServiceUsageName.STORAGE),
    },
  };
}
