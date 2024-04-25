import { PermissionErrorHandlingOptions } from './types';

/**
 * ANY_RESOURCE is used to describe any Google Cloud resource.
 * This includes all assets both ingested and not ingested with this integration
 */
export const ANY_RESOURCE = 'resource';

export const DEFAULT_FETCH_AUTHORIZATION_HANDLING_OPTIONS: PermissionErrorHandlingOptions =
  {
    throwMissingAuthPermissionError: false,
    publishMissingPermissionWarnEvent: true,
  };

export const DEFAULT_FETCH_BASIC_API_CALL_AUTHORIZATION_HANDLING_OPTIONS = {
  throwMissingAuthPermissionError: true,
  publishMissingPermissionWarnEvent: false,
};
