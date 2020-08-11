import { Client } from '../../google-cloud/client';
import { ServiceUsageListFilter } from '../../google-cloud/types';
import { google, serviceusage_v1 } from 'googleapis';

export function createServiceMapper(
  callback: (data: serviceusage_v1.Schema$Api) => Promise<void>,
) {
  return async (data: serviceusage_v1.Schema$ListServicesResponse) => {
    for (const service of data.services || []) {
      await callback(service);
    }
  };
}

export class ServiceUsageClient extends Client {
  private client = google.serviceusage('v1');

  async iterateServices(
    callback: (
      data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
    ) => Promise<void>,
    paramOverrides?: serviceusage_v1.Params$Resource$Services$List,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(async (nextPageToken) => {
      return this.client.services.list({
        parent: `projects/${this.projectId}`,
        auth,
        pageToken: nextPageToken,
        ...paramOverrides,
      });
    }, createServiceMapper(callback));
  }

  async iterateEnabledServices(
    callback: (
      data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
    ) => Promise<void>,
  ): Promise<void> {
    return this.iterateServices(callback, {
      filter: ServiceUsageListFilter.ENABLED,
    });
  }

  async collectEnabledServices(): Promise<
    serviceusage_v1.Schema$GoogleApiServiceusageV1Service[]
  > {
    const enabledServices: serviceusage_v1.Schema$GoogleApiServiceusageV1Service[] = [];

    await this.iterateEnabledServices(async (data) => {
      enabledServices.push(data);
      return Promise.resolve();
    });

    return enabledServices;
  }
}
