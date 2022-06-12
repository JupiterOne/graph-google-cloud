import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

interface IntegrationProviderApiErrorOptions {
  /**
   * An optional reference to the error that caused this error. The cause tree
   * will be included in logging of the error to assist problem resolution.
   */
  cause?: Error;
  /**
   * The endpoint that provided the response indicating the authentication
   * parameters are invalid.
   */
  endpoint: string;
  /**
   * The response status code, i.e. `401`, or in the case of GraphQL, whatever
   * error code provided by the response body.
   */
  status: string | number;
  /**
   * The response status text, i.e. `"Unauthorized"`.
   */
  statusText: string;
}

/**
 * Thrown when a GCP service API is disabled, which prevents the integration
 * from collecting data from the specific API
 */
export class GoogleCloudServiceApiDisabledError extends IntegrationProviderAPIError {
  constructor(
    options: IntegrationProviderApiErrorOptions & {
      code?: string;
      message?: string;
      fatal?: boolean;
    },
  ) {
    super({
      ...options,
      code: 'GOOGLE_CLOUD_SERVICE_API_DISABLED',
      message: options.message,
      fatal: false,
    });
  }
}
