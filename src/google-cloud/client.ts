import { IntegrationConfig } from '../types';
import { google } from 'googleapis';
import {
  JWT,
  Compute,
  UserRefreshClient,
  CredentialBody,
} from 'google-auth-library';
import { GaxiosError, GaxiosResponse } from 'gaxios';
import {
  IntegrationProviderAuthorizationError,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';

export interface ClientOptions {
  config: IntegrationConfig;
}

export interface PageableResponse {
  nextPageToken?: string;
}

export type PageableGaxiosResponse<T> = GaxiosResponse<
  T & {
    nextPageToken?: string | null | undefined;
  }
>;

export type GoogleClientAuth = JWT | Compute | UserRefreshClient;

export function withErrorHandling<T extends (...params: any) => any>(fn: T) {
  return async (...params: any) => {
    try {
      return await fn(...params);
    } catch (error) {
      handleError(error);
    }
  };
}

function handleError(error: GaxiosError): never {
  let ErrorConstructor = IntegrationProviderAPIError;
  const code = error.response?.status || 'UNKNOWN';
  if (
    // All "Unauthorized" errors
    code == 403 ||
    // Billing errors seen in https://dev.azure.com/jupiterone/Platform/_workitems/edit/2089
    (code == 400 && error.message?.match && error.message.match(/billing/i))
  ) {
    ErrorConstructor = IntegrationProviderAuthorizationError;
  }
  const err = new ErrorConstructor({
    cause: error,
    endpoint: error.response?.config?.url || 'UNKNOWN',
    status: code,
    statusText: error.response?.statusText || 'UNKNOWN',
  });
  err.message = error.message;
  throw err;
}

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
  private auth: GoogleClientAuth;

  constructor({ config }: ClientOptions) {
    this.projectId = config.serviceAccountKeyConfig.project_id;
    this.credentials = {
      client_email: config.serviceAccountKeyConfig.client_email,
      private_key: config.serviceAccountKeyConfig.private_key,
    };
  }

  private async getClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    await client.getAccessToken();
    return client;
  }

  async getAuthenticatedServiceClient(): Promise<GoogleClientAuth> {
    if (!this.auth) {
      this.auth = await this.getClient();
    }

    return this.auth;
  }
}
