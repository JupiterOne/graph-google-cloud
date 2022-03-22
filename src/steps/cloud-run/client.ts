import { Client } from '../../google-cloud/client';
import { google, run_v1 } from 'googleapis';

export class CloudRunClient extends Client {
  private client = google.run({ version: 'v1', retry: false });

  async iterateCloudRunServices(
    callback: (data: run_v1.Schema$Service) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        // Doesn't support pageToken
        return this.client.namespaces.services.list({
          parent: `namespaces/${this.projectId}`,
          auth,
        });
      },
      async (data: run_v1.Schema$ListServicesResponse) => {
        for (const service of data.items || []) {
          await callback(service);
        }
      },
    );
  }

  async iterateCloudRunRoutes(
    callback: (data: run_v1.Schema$Route) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        // Doesn't support pageToken
        return this.client.namespaces.routes.list({
          parent: `namespaces/${this.projectId}`,
          auth,
        });
      },
      async (data: run_v1.Schema$ListRoutesResponse) => {
        for (const route of data.items || []) {
          await callback(route);
        }
      },
    );
  }

  async iterateCloudRunConfigurations(
    callback: (data: run_v1.Schema$Configuration) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        // Doesn't support pageToken
        return this.client.namespaces.configurations.list({
          parent: `namespaces/${this.projectId}`,
          auth,
        });
      },
      async (data: run_v1.Schema$ListConfigurationsResponse) => {
        for (const configuration of data.items || []) {
          await callback(configuration);
        }
      },
    );
  }
}
