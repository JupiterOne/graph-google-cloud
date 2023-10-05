import {
  IntegrationExecutionContext,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';
import { ServiceUsageClient } from './steps/service-usage/client';
import { IntegrationConfig, SerializedIntegrationConfig } from './types';
import { deserializeIntegrationConfig } from './utils/integrationConfig';
import { google } from 'googleapis';
import { handleApiClientError } from './google-cloud/client';
import { ServiceUsageListFilter } from './google-cloud/types';

export async function executeTestRequest(
  config: IntegrationConfig,
  logger: IntegrationLogger,
) {
  try {
    const client = google.serviceusage({ version: 'v1', retry: false });
    const googleClient = new ServiceUsageClient({ config }, logger);
    const auth = await googleClient.getAuthenticatedServiceClient();

    await client.services.list({
      parent: `projects/${config.serviceAccountKeyConfig.project_id}`,
      pageSize: 200,
      auth: auth,
      filter: ServiceUsageListFilter.ENABLED,
    });
  } catch (err) {
    throw handleApiClientError(err);
  }
}

export async function validateInvocation(
  context: IntegrationExecutionContext<SerializedIntegrationConfig>,
) {
  const { instance, logger } = context;
  const { config: serializedIntegrationConfig } = instance;
  const config = (context.instance.config = deserializeIntegrationConfig(
    serializedIntegrationConfig,
  ));

  await executeTestRequest(config, logger);
}
