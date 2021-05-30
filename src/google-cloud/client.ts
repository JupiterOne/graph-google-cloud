import { IntegrationConfig } from '../types';
import { google } from 'googleapis';
import { CredentialBody, BaseExternalAccountClient } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import {
  IntegrationProviderAuthorizationError,
  IntegrationProviderAPIError,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';
import { createErrorProps } from './utils/createErrorProps';

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
}

export interface PageableResponse {
  nextPageToken?: string;
}

export type PageableGaxiosResponse<T> = GaxiosResponse<
  T & {
    nextPageToken?: string | null | undefined;
  }
>;

export async function iterateApi<T>(
  fn: (nextPageToken?: string) => Promise<PageableGaxiosResponse<T>>,
  callback: (data: T) => Promise<void>,
) {
  let nextPageToken: string | undefined;

  do {
    const result = await withErrorHandling(fn)(nextPageToken);
    nextPageToken = result.data.nextPageToken || undefined;
    await callback(result.data);
  } while (nextPageToken);
}

export class Client {
  readonly projectId: string;
  readonly iterateApi = iterateApi;

  private credentials: CredentialBody;
  private auth: BaseExternalAccountClient;

  constructor({ config, projectId }: ClientOptions) {
    this.projectId =
      projectId ||
      config.projectId ||
      config.serviceAccountKeyConfig.project_id;
    this.credentials = {
      client_email: config.serviceAccountKeyConfig.client_email,
      private_key: config.serviceAccountKeyConfig.private_key,
    };
  }

  private async getClient(): Promise<BaseExternalAccountClient> {
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = (await auth.getClient()) as BaseExternalAccountClient;
    await client.getAccessToken();
    return client;
  }

  async getAuthenticatedServiceClient(): Promise<BaseExternalAccountClient> {
    if (!this.auth) {
      this.auth = await this.getClient();
    }

    return this.auth;
  }
}

export function withErrorHandling<T extends (...params: any) => any>(fn: T) {
  return async (...params: any) => {
    try {
      return await fn(...params);
    } catch (error) {
      handleError(error);
    }
  };
}

/**
 * Codes unknown error into JupiterOne errors
 */
function handleError(error: any): never {
  // If the error was already handled, forward it on
  if (error instanceof IntegrationError) {
    throw error;
  }

  let err;
  const errorProps = createErrorProps(error);
  const code = error.response?.status;
  if (code == 403) {
    err = new IntegrationProviderAuthorizationError(errorProps);
  } else if (
    code == 400 &&
    error.message?.match &&
    error.message.match(/billing/i)
  ) {
    err = new IntegrationProviderAuthorizationError(errorProps);
  } else {
    err = new IntegrationProviderAPIError(errorProps);
  }
  if (shouldKeepErrorMessage(error)) {
    err.message = error.message;
  }
  throw err;
}

function shouldKeepErrorMessage(error: any) {
  const errorMessagesToKeep = [
    'billing is disabled',
    'requires billing to be enabled',
    'it is disabled',
    'is not a workspace',
  ];
  return (
    error?.message?.match &&
    error.message.match(createRegex(errorMessagesToKeep))
  );
}

function createRegex(regexes: string[]) {
  return new RegExp(regexes.map((regex) => '(' + regex + ')').join('|'), 'i');
}
