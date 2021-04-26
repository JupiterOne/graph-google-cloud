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

interface PublishUnprocessedBucketsEventParams {
  logger: IntegrationLogger;
  bucketIds: string;
}

export function publishUnprocessedBucketsEvent({
  logger,
  bucketIds,
}: PublishUnprocessedBucketsEventParams) {
  logger.publishEvent({
    name: 'unprocessed_buckets',
    description: `Could not fetch the following buckets as their policies are inaccessible (reason: buckets are requestor pays and cannot be processed): ${bucketIds}"`,
  });
}
