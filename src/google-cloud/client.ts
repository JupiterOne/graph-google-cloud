import {
  IntegrationError,
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthorizationError,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';
import { retry } from '@lifeomic/attempt';
import { GaxiosError, GaxiosResponse } from 'gaxios';
import { BaseExternalAccountClient, CredentialBody } from 'google-auth-library';
import { google } from 'googleapis';
import pMap from 'p-map';
import { IntegrationConfig, PermissionErrorHandlingOptions } from '../types';
import { createErrorProps } from './utils/createErrorProps';
import {
  DEFAULT_FETCH_BASIC_API_CALL_AUTHORIZATION_HANDLING_OPTIONS,
  DEFAULT_FETCH_AUTHORIZATION_HANDLING_OPTIONS,
} from '../constants';

export interface ClientOptions {
  config: IntegrationConfig;
  /**
   * Specific project ID to target. The order of overrides is the following:
   *
   * ClientOptions.projectId ||
   * config.projectId ||
   * config.serviceAccountKeyConfig.project_id
   */
  projectId?: string;
  organizationId?: string;
  onRetry?: (err: any) => void;
}

export interface PageableResponse {
  nextPageToken?: string;
}

export type PageableGaxiosResponse<T> = GaxiosResponse<
  T & {
    nextPageToken?: string | null | undefined;
  }
>;

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class Client {
  readonly projectId: string;
  readonly organizationId?: string;
  readonly folderId?: string;
  readonly logger: IntegrationLogger;

  private credentials: CredentialBody;
  private auth: BaseExternalAccountClient;
  private readonly onRetry?: (err: any) => void;
  private permissionsWarnLogs: Set<string>;

  constructor(
    { config, projectId, organizationId, onRetry }: ClientOptions,
    logger: IntegrationLogger,
  ) {
    this.projectId =
      projectId ||
      config.projectId ||
      config.serviceAccountKeyConfig.project_id;
    this.organizationId = organizationId || config.organizationId;
    this.credentials = {
      client_email: config.serviceAccountKeyConfig.client_email,
      private_key: config.serviceAccountKeyConfig.private_key,
    };
    this.folderId = config.folderId;
    this.onRetry = onRetry;
    this.logger = logger;
    this.permissionsWarnLogs = new Set();
  }

  private async getClient(): Promise<BaseExternalAccountClient> {
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = (await this.withErrorHandling(
      () => auth.getClient(),
      this.logger,
      undefined,
      DEFAULT_FETCH_BASIC_API_CALL_AUTHORIZATION_HANDLING_OPTIONS,
    )) as BaseExternalAccountClient;
    await this.withErrorHandling(
      () => client.getAccessToken(),
      this.logger,
      undefined,
      DEFAULT_FETCH_BASIC_API_CALL_AUTHORIZATION_HANDLING_OPTIONS,
    );
    return client;
  }

  /**
   * Public methods
   */

  public async getAuthenticatedServiceClient(): Promise<BaseExternalAccountClient> {
    if (!this.auth) {
      try {
        this.auth = await this.getClient();
      } catch (err) {
        throw handleApiClientError(err);
      }
    }

    return this.auth;
  }

  public async iterateApi<T>(
    fn: (nextPageToken?: string) => Promise<PageableGaxiosResponse<T>>,
    callback: (data: T) => Promise<void>,
    stepId: string,
    suggestedPermissions: string[],
    options?: PermissionErrorHandlingOptions,
  ) {
    return this.forEachPage(async (nextPageToken) => {
      const result = await this.withErrorHandling(
        () => fn(nextPageToken),
        this.logger,
        {
          stepId,
          suggestedPermissions,
        },
        options,
      );

      if (result) {
        await callback(result.data);
      }

      return result;
    });
  }

  public async forEachPage<T>(
    cb: (
      nextToken: string | undefined,
    ) => Promise<PageableGaxiosResponse<T> | undefined>,
  ): Promise<any> {
    let nextToken: string | undefined;
    do {
      const response = await cb(nextToken);
      if (!response) return;
      nextToken = response.data.nextPageToken
        ? response.data.nextPageToken
        : undefined;
    } while (nextToken);
  }

  public interceptAuthorizationError(
    logMissingAuhtorizationWarnEvent: boolean,
    err: GaxiosError,
    logger: IntegrationLogger,
    stepMetadata?: {
      suggestedPermissions: string[];
      stepId: string;
    },
  ): boolean {
    let isAuthorizationError = false;

    const status =
      err.response?.status !== undefined ? err.response?.status : err.status;

    /**
     * 404 is usually not a permission issue. In this case, when a user doesn't have access to a
     * specific resource it will return a 404 status code, when its a permission issue.
     */
    if ((status == 403 || status == 404) && !isQuotaLimitError(err)) {
      isAuthorizationError = true;

      if (
        logMissingAuhtorizationWarnEvent &&
        stepMetadata &&
        stepMetadata.stepId &&
        stepMetadata.suggestedPermissions
      ) {
        const warnLog = `[${
          stepMetadata.stepId
        }] - Unable to successfuly complete data ingestion for step. The following permissions are required: ${stepMetadata.suggestedPermissions.join(
          ', ',
        )}. If you prefer using Google managed roles, you can find the required ones here: https://docs.jupiterone.io/integrations/directory/google-cloud.`;

        if (!this.permissionsWarnLogs.has(warnLog)) {
          logger.publishWarnEvent({
            name: IntegrationWarnEventName.MissingPermission,
            description: warnLog,
          });

          this.permissionsWarnLogs.add(warnLog);
        }
      }
    }

    return isAuthorizationError;
  }

  public async withErrorHandling<T>(
    fn: () => Promise<T>,
    logger: IntegrationLogger,
    stepMetadata?: {
      suggestedPermissions: string[];
      stepId: string;
    },
    options: PermissionErrorHandlingOptions = DEFAULT_FETCH_AUTHORIZATION_HANDLING_OPTIONS,
  ) {
    const onRetry = this.onRetry;

    try {
      return await retry(
        async () => {
          return await fn();
        },
        {
          delay: 2_000,
          timeout: 182_000, // Need to set a timeout, otherwise we might wait for a response indefinitely.
          maxAttempts: 6,
          factor: 2.25, //t=0s, 2s, 4.5s, 10.125s, 22.78125s, 51.2578125 (90.6640652s)

          handleError: (err, ctx) => {
            const isPermissionsError = this.interceptAuthorizationError(
              options.publishMissingPermissionWarnEvent || false,
              err,
              logger,
              stepMetadata?.stepId && stepMetadata.suggestedPermissions.length
                ? stepMetadata
                : undefined,
            );

            const newError = handleApiClientError(err);

            if (!newError.retryable) {
              this.logger.info(
                {
                  err: newError,
                  stepId: stepMetadata?.stepId,
                },
                'Error when trying to call GCP API',
              );
              if (
                isPermissionsError &&
                !options.throwMissingAuthPermissionError
              ) {
                throw new AuthorizationError('');
              }

              throw newError;
            } else if (onRetry) {
              onRetry(err);
            }
          },
        },
      );
    } catch (err) {
      if (!(err instanceof AuthorizationError)) {
        throw err;
      }
    }
  }

  /**
   * Executes a map of asynchronous callbacks concurrently
   * @param options.concurrency default: 5
   */
  protected async executeConcurrently<T>(
    resources: T[] | undefined,
    cb: (resource: T) => Promise<void>,
    options: { concurrency?: number } = { concurrency: 5 },
  ) {
    await pMap(resources || [], cb, { concurrency: options.concurrency });
  }
}

/**
 * Helper functions
 */

/**
 * Codes unknown error into JupiterOne errors
 */
export function handleApiClientError(error: GaxiosError) {
  // If the error was already handled, forward it on
  if (error instanceof IntegrationError) {
    return error;
  }

  let err;
  const errorProps = createErrorProps(error);
  const code = error.response?.status as number;

  // Per these two sets of docs, and depending on the api, gcloud
  // will return a 403 or 429 error to signify rate limiting:
  // https://cloud.google.com/compute/docs/api-rate-limits
  // https://cloud.google.com/resource-manager/docs/core_errors
  if (code == 403) {
    err = new IntegrationProviderAuthorizationError(errorProps);

    if (isQuotaLimitError(error)) {
      err.retryable = true;
    }
  } else if (isBillingError(error)) {
    err = new IntegrationProviderAuthorizationError(errorProps);
  } else if (code == 401) {
    err = new IntegrationProviderAuthorizationError(errorProps);
  } else if (code === 429 || code >= 500) {
    err = new IntegrationProviderAPIError(errorProps);
    (err as any).retryable = true;
  } else {
    err = new IntegrationProviderAPIError(errorProps);
  }

  if (shouldKeepErrorMessage(error)) {
    err.message = error.message;
  }

  return err;
}

export function isQuotaLimitError(err: GaxiosError) {
  return err.message?.match && err.message.match(/Quota exceeded/i);
}

export function isBillingError(err: GaxiosError) {
  return (
    err.status == 400 && err.message?.match && err.message.match(/billing/i)
  );
}

export function shouldKeepErrorMessage(error: any) {
  const errorMessagesToKeep = [
    'billing is disabled',
    'requires billing to be enabled',
    'it is disabled',
    'is not a workspace',
    // Example: Cloud Text-to-Speech API has not been used in project 123456789 before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview?project=123456789 then retry. If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.
    'If you enabled this API recently',
  ];
  return (
    error?.message?.match &&
    error.message.match(createRegex(errorMessagesToKeep))
  );
}

function createRegex(regexes: string[]) {
  return new RegExp(regexes.map((regex) => '(' + regex + ')').join('|'), 'i');
}
