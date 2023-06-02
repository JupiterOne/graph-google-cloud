import { apigateway_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class ApiGatewayClient extends Client {
  private client = google.apigateway({ version: 'v1', retry: false });

  async getApiPolicy(
    apiId: string,
  ): Promise<apigateway_v1.Schema$ApigatewayPolicy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.locations.apis.getIamPolicy({
      resource: `projects/${this.projectId}/locations/global/apis/${apiId}`,
      auth,
    });

    return result.data;
  }

  async getApiConfigPolicy(
    apiId: string,
    configId: string,
  ): Promise<apigateway_v1.Schema$ApigatewayPolicy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result =
      await this.client.projects.locations.apis.configs.getIamPolicy({
        resource: `projects/${this.projectId}/locations/global/apis/${apiId}/configs/${configId}`,
        auth,
      });

    return result.data;
  }

  async getGatewayPolicy(
    gatewayId: string,
  ): Promise<apigateway_v1.Schema$ApigatewayPolicy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.locations.gateways.getIamPolicy({
      resource: `projects/${this.projectId}/locations/global/gateways/${gatewayId}`,
      auth,
    });

    return result.data;
  }

  async iterateGateways(
    callback: (data: apigateway_v1.Schema$ApigatewayGateway) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.gateways.list({
          parent: `projects/${this.projectId}/locations/-`,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: apigateway_v1.Schema$ApigatewayListGatewaysResponse) => {
        for (const gateway of data.gateways || []) {
          await callback(gateway);
        }
      },
    );
  }

  async iterateApis(
    callback: (data: apigateway_v1.Schema$ApigatewayApi) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.apis.list({
          parent: `projects/${this.projectId}/locations/-`,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: apigateway_v1.Schema$ApigatewayListApisResponse) => {
        for (const api of data.apis || []) {
          await callback(api);
        }
      },
    );
  }

  async iterateApiConfigs(
    apiId: string,
    callback: (data: apigateway_v1.Schema$ApigatewayApiConfig) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.apis.configs.list({
          parent: `projects/${this.projectId}/locations/global/apis/${apiId}`,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: apigateway_v1.Schema$ApigatewayListApiConfigsResponse) => {
        for (const config of data.apiConfigs || []) {
          await callback(config);
        }
      },
    );
  }
}
