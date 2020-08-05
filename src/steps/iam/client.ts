import { google, iam_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class IamClient extends Client {
  private client = google.iam('v1');

  async iterateCustomRoles(
    callback: (data: iam_v1.Schema$Role) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.roles.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}`,
          view: 'FULL',
        });
      },
      async (data: iam_v1.Schema$ListRolesResponse) => {
        for (const role of data.roles || []) {
          await callback(role);
        }
      },
    );
  }

  async iterateServiceAccounts(
    callback: (data: iam_v1.Schema$ServiceAccount) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.serviceAccounts.list({
          auth,
          name: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: iam_v1.Schema$ListServiceAccountsResponse) => {
        for (const account of data.accounts || []) {
          await callback(account);
        }
      },
    );
  }

  async iterateServiceAccountKeys(
    serviceAccountName: string,
    callback: (data: iam_v1.Schema$ServiceAccountKey) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    const response = await this.client.projects.serviceAccounts.keys.list({
      auth,
      name: serviceAccountName,
    });

    for (const k of response.data.keys || []) {
      await callback(k);
    }
  }
}
