import { IntegrationExecutionContext } from '@jupiterone/integration-sdk-core';
import { ServiceUsageClient } from './steps/service-usage/client';
import { IntegrationConfig, SerializedIntegrationConfig } from './types';
import { deserializeIntegrationConfig } from './utils/integrationConfig';

export async function executeTestRequest(config: IntegrationConfig) {
  const googleClient = new ServiceUsageClient({ config });

  return googleClient.collectEnabledServices();
}

export async function validateInvocation(
  context: IntegrationExecutionContext<SerializedIntegrationConfig>,
) {
  const { instance } = context;
  const { config: serializedIntegrationConfig } = instance;
  const config = (context.instance.config = deserializeIntegrationConfig(
    serializedIntegrationConfig,
  ));

  await executeTestRequest(config);
}
