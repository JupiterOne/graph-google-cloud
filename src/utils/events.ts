import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

interface PublishMissingPermissionEventParams {
  logger: IntegrationLogger;
  permission: string;
  stepId: string;
}

export function publishMissingPermissionEvent({
  logger,
  permission,
  stepId,
}: PublishMissingPermissionEventParams) {
  logger.publishEvent({
    name: 'missing_permission',
    description: `"${permission}" is not a required permission to run the Google Cloud integration, but is required for step "${stepId}"`,
  });
}
