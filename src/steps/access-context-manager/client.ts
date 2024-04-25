import { accesscontextmanager_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  AccessContextManagerPermissions,
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
  STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
} from './constants';

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
      STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
      AccessContextManagerPermissions.STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
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
      STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
      AccessContextManagerPermissions.STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
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
      STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
      AccessContextManagerPermissions.STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
    );
  }
}
