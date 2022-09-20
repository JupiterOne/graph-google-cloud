import { google, sqladmin_v1beta4 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class SQLAdminClient extends Client {
  private client = google.sqladmin({ version: 'v1beta4', retry: false });

  async iterateCloudSQLInstances(
    callback: (data: sqladmin_v1beta4.Schema$DatabaseInstance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    const response = await this.withErrorHandling(async () =>
      this.client.instances.list({
        project: this.projectId,
        auth,
      }),
    );

    for (const sqlInstance of response.data.items || []) {
      await callback(sqlInstance);
    }
  }
}
