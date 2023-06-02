import { Client } from '../../google-cloud/client';
import { appengine_v1, google } from 'googleapis';

export class AppEngineClient extends Client {
  private client = google.appengine({ version: 'v1', retry: false });

  async getAppEngineApplication() {
    const auth = await this.getAuthenticatedServiceClient();

    const response = await this.client.apps.get({
      appsId: this.projectId,
      auth,
    });

    return response.data;
  }

  async iterateAppEngineServices(
    callback: (data: appengine_v1.Schema$Service) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.apps.services.list({
          auth,
          appsId: this.projectId,
          pageToken: nextPageToken,
        });
      },
      async (data: appengine_v1.Schema$ListServicesResponse) => {
        for (const service of data.services || []) {
          await callback(service);
        }
      },
    );
  }

  async iterateAppEngineServiceVersions(
    serviceId: string,
    callback: (data: appengine_v1.Schema$Version) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.apps.services.versions.list({
          auth,
          appsId: this.projectId,
          servicesId: serviceId,
          pageToken: nextPageToken,
        });
      },
      async (data: appengine_v1.Schema$ListVersionsResponse) => {
        for (const version of data.versions || []) {
          await callback(version);
        }
      },
    );
  }

  async iterateAppEngineVersionInstances(
    serviceId: string,
    versionId: string,
    callback: (data: appengine_v1.Schema$Instance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.apps.services.versions.instances.list({
          auth,
          appsId: this.projectId,
          servicesId: serviceId,
          versionsId: versionId,
          pageToken: nextPageToken,
        });
      },
      async (data: appengine_v1.Schema$ListInstancesResponse) => {
        for (const instance of data.instances || []) {
          await callback(instance);
        }
      },
    );
  }
}
