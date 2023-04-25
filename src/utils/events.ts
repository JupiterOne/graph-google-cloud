import {
  IntegrationLogger,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';

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
  logger.publishWarnEvent({
    name: IntegrationWarnEventName.MissingPermission,
    description: `"${permission}" is not a required permission to run the Google Cloud integration, but is required for step "${stepId}"`,
  });
}

interface PublishUnprocessedBucketsEventParams {
  logger: IntegrationLogger;
  bucketIdsWithUnprocessedPolicies: string[];
}

export function publishUnprocessedBucketsEvent({
  logger,
  bucketIdsWithUnprocessedPolicies,
}: PublishUnprocessedBucketsEventParams) {
  logger.publishEvent({
    name: 'unprocessed_buckets',
    description: `Could not fetch the following inaccessible buckets policies (reason: buckets are requestor pays and cannot be processed. See here for more information: https://cloud.google.com/storage/docs/requester-pays): ${bucketIdsWithUnprocessedPolicies.join(
      ', ',
    )}"`,
  });
}

interface PublishUnsupportedConfigEventParams {
  logger: IntegrationLogger;
  resource: string;
  reason: string;
}

export function publishUnsupportedConfigEvent({
  logger,
  resource,
  reason,
}: PublishUnsupportedConfigEventParams) {
  logger.publishEvent({
    name: 'unsupported_config',
    description: `Could not process "${resource}" because of the "${reason}" configuration`,
  });
}
