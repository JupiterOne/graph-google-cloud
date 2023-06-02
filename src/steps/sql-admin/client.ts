import { google, sqladmin_v1beta4 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class SQLAdminClient extends Client {
  private client = google.sqladmin({ version: 'v1beta4', retry: false });

  async iterateCloudSQLInstances(
    callback: (data: sqladmin_v1beta4.Schema$DatabaseInstance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.instances.list({
          project: this.projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: sqladmin_v1beta4.Schema$InstancesListResponse) => {
        for (const sqlInstance of data.items || []) {
          await callback(sqlInstance);
        }
      },
    );
  }
}
