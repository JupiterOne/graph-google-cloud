import { accesscontextmanager_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class AccessContextManagerClient extends Client {
  private client = google.accesscontextmanager({ version: 'v1', retry: false });

  async iterateAccessPolicies(
    callback: (
      data: accesscontextmanager_v1.Schema$AccessPolicy,
    ) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken: string | undefined) => {
        return this.client.accessPolicies.list({
          auth,
          parent: `organizations/${this.organizationId}`,
          pageToken: nextPageToken,
        });
      },
      async (
        data: accesscontextmanager_v1.Schema$ListAccessPoliciesResponse,
      ) => {
        for (const accessPolicy of data.accessPolicies || []) {
          await callback(accessPolicy);
        }
      },
    );
  }

  async iterateAccessLevels(
    accessPolicyId: string,
    callback: (
      data: accesscontextmanager_v1.Schema$AccessLevel,
    ) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.accessPolicies.accessLevels.list({
          auth,
          parent: accessPolicyId,
          pageToken: nextPageToken,
        });
      },
      async (data: accesscontextmanager_v1.Schema$ListAccessLevelsResponse) => {
        for (const accessLevel of data.accessLevels || []) {
          await callback(accessLevel);
        }
      },
    );
  }

  async iterateServicePerimeters(
    accessPolicyId: string,
    callback: (
      data: accesscontextmanager_v1.Schema$ServicePerimeter,
    ) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.accessPolicies.servicePerimeters.list({
          auth,
          parent: accessPolicyId,
          pageToken: nextPageToken,
        });
      },
      async (
        data: accesscontextmanager_v1.Schema$ListServicePerimetersResponse,
      ) => {
        for (const servicePerimeter of data.servicePerimeters || []) {
          await callback(servicePerimeter);
        }
      },
    );
  }
}
