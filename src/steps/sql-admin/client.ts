import { google, sqladmin_v1beta4 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export function createCloudSQLInstanceClientMapper(
  callback: (data: sqladmin_v1beta4.Schema$DatabaseInstance) => Promise<void>,
) {
  return async (data: sqladmin_v1beta4.Schema$DatabasesListResponse) => {
    for (const sqlInstance of data.items || []) {
      await callback(sqlInstance);
    }
  };
}

export class SQLAdminClient extends Client {
  private client = google.sqladmin('v1beta4');

  async iterateCloudSQLInstances(
    projectId: string,
    callback: (data: sqladmin_v1beta4.Schema$DatabaseInstance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.instances.list({
          project: projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: sqladmin_v1beta4.Schema$DatabasesListResponse) => {
        for (const sqlInstance of data.items || []) {
          await callback(sqlInstance);
        }
      },
    );
  }
}
