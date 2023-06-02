import { google, spanner_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class SpannerClient extends Client {
  private client = google.spanner({ version: 'v1', retry: false });

  async getInstancePolicy(
    instanceId: string,
  ): Promise<spanner_v1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.instances.getIamPolicy({
      resource: `projects/${this.projectId}/instances/${instanceId}`,
      auth,
    });

    return result.data;
  }

  async getDatabasePolicy(
    instanceId: string,
    databaseId: string,
  ): Promise<spanner_v1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.instances.databases.getIamPolicy({
      resource: `projects/${this.projectId}/instances/${instanceId}/databases/${databaseId}`,
      auth,
    });

    return result.data;
  }

  async iterateInstances(
    callback: (data: spanner_v1.Schema$Instance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.instances.list({
          auth,
          parent: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: spanner_v1.Schema$ListInstancesResponse) => {
        for (const instance of data.instances || []) {
          await callback(instance);
        }
      },
    );
  }

  async iterateInstanceConfigs(
    callback: (data: spanner_v1.Schema$InstanceConfig) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.instanceConfigs.list({
          auth,
          parent: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: spanner_v1.Schema$ListInstanceConfigsResponse) => {
        for (const instanceConfig of data.instanceConfigs || []) {
          await callback(instanceConfig);
        }
      },
    );
  }

  async iterateInstanceDatabases(
    spannerId: string,
    callback: (data: spanner_v1.Schema$Database) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.instances.databases.list({
          auth,
          parent: `projects/${this.projectId}/instances/${spannerId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: spanner_v1.Schema$ListDatabasesResponse) => {
        for (const database of data.databases || []) {
          await callback(database);
        }
      },
    );
  }
}
