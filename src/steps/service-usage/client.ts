import { Client } from '../../google-cloud/client';
import { ServiceUsageListFilter } from '../../google-cloud/types';
import { google, serviceusage_v1 } from 'googleapis';

export class ServiceUsageClient extends Client {
  private client = google.serviceusage('v1');

  async iterateServices(
    callback: (
      data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
    ) => Promise<void>,
    paramOverrides?: serviceusage_v1.Params$Resource$Services$List,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    // Sometimes the service list API returns duplicate services...This set is
    // used to prevent returning any duplicates to the caller.
    const serviceSet = new Set<string>();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.services.list({
          parent: `projects/${this.projectId}`,
          auth,
          pageToken: nextPageToken,
          ...paramOverrides,
        });
      },
      async (data: serviceusage_v1.Schema$ListServicesResponse) => {
        for (const service of data.services || []) {
          const serviceName = service.name as string;

          if (serviceSet.has(serviceName)) {
            continue;
          }

          serviceSet.add(serviceName);
          await callback(service);
        }
      },
    );
  }

  async iterateEnabledServices(
    callback: (
      data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
    ) => void | Promise<void>,
  ): Promise<void> {
    return this.iterateServices(
      async (result) => {
        await callback(result);
      },
      {
        filter: ServiceUsageListFilter.ENABLED,
      },
    );
  }

  async collectEnabledServices(): Promise<
    serviceusage_v1.Schema$GoogleApiServiceusageV1Service[]
  > {
    const enabledServices: serviceusage_v1.Schema$GoogleApiServiceusageV1Service[] = [];

    await this.iterateEnabledServices((data) => {
      enabledServices.push(data);
    });

    return enabledServices;
  }
}
