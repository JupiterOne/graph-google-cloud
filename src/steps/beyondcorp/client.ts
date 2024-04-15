import { beyondcorp_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class beyondcorpClient extends Client {
  private client = google.beyondcorp({ version: 'v1', retry: false });

  async iterateAppConnector(
    callback: (
      data: beyondcorp_v1.Schema$GoogleCloudBeyondcorpAppconnectorsV1AppConnector,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.appConnectors.list({
          auth,
          parent: `projects/${this.projectId}/locations/-`,
          pageToken: nextPageToken,
        });
      },
      async (
        data: beyondcorp_v1.Schema$GoogleCloudBeyondcorpAppconnectorsV1ListAppConnectorsResponse,
      ) => {
        for (const connectors of data.appConnectors || []) {
          await callback(connectors);
        }
      },
    );
  }

  async iterateGatway(
    callback: (
      data: beyondcorp_v1.Schema$GoogleCloudBeyondcorpAppconnectionsV1AppConnectionGateway,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.appGateways.list({
          auth,
          parent: `projects/${this.projectId}/locations/us-central1`,
          pageToken: nextPageToken,
        });
      },
      async (data: beyondcorp_v1.Schema$ListAppGatewaysResponse) => {
        for (const gateway of data.appGateways || []) {
          await callback(gateway);
        }
      },
    );
  }

  async iterateAppConnection(
    callback: (
      data: beyondcorp_v1.Schema$GoogleCloudBeyondcorpAppconnectionsV1AppConnection,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.appConnections.list({
          auth,
          parent: `projects/${this.projectId}/locations/-`,
          pageToken: nextPageToken,
        });
      },
      async (
        data: beyondcorp_v1.Schema$GoogleCloudBeyondcorpAppconnectionsV1ListAppConnectionsResponse,
      ) => {
        for (const connections of data.appConnections || []) {
          await callback(connections);
        }
      },
    );
  }

  async iteratePartnerTenantRule(
    callback: (data: beyondcorp_v1.Schema$GoogleIamV1Policy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async () => {
        return this.client.organizations.locations.global.partnerTenants.getIamPolicy(
          {
            auth,
            resource: `organizations/${this.organizationId}/locations/global/partnerTenants/-`,
          },
        );
      },
      async (data: beyondcorp_v1.Schema$GoogleIamV1Policy) => {
        return callback(data);
      },
    );
  }
}
