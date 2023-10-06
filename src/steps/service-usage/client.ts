import { Client } from '../../google-cloud/client';
import { ServiceUsageListFilter } from '../../google-cloud/types';
import { google, serviceusage_v1 } from 'googleapis';
import { IntegrationConfig } from '../..';
import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

export class ServiceUsageClient extends Client {
  private client = google.serviceusage({ version: 'v1', retry: false });

  async iterateServices(
    callback: (
      data: serviceusage_v1.Schema$GoogleApiServiceusageV1Service,
    ) => Promise<void>,
    paramOverrides?: serviceusage_v1.Params$Resource$Services$List,
    onComplete?: (data: {
      totalRequestsMade: number;
      totalResourcesReturned: number;
      maximumResourcesPerPage: number;
    }) => void,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    // Sometimes the service list API returns duplicate services...This set is
    // used to prevent returning any duplicates to the caller.
    const serviceSet = new Set<string>();

    let totalRequestsMade = 0;
    let totalResourcesReturned = 0;
    let maximumResourcesPerPage = 0;

    try {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.services.list({
            parent: `projects/${this.projectId}`,
            auth,
            pageSize: 200,
            pageToken: nextPageToken,
            ...paramOverrides,
          });
        },
        async (data: serviceusage_v1.Schema$ListServicesResponse) => {
          totalRequestsMade++;
          if (data.services) {
            totalResourcesReturned += data.services.length;
            if (data.services.length > maximumResourcesPerPage) {
              maximumResourcesPerPage = data.services.length;
            }
          }
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
    } finally {
      if (onComplete) {
        onComplete({
          totalRequestsMade,
          totalResourcesReturned,
          maximumResourcesPerPage,
        });
      }
    }
  }

  async collectEnabledServices(): Promise<
    serviceusage_v1.Schema$GoogleApiServiceusageV1Service[]
  > {
    const enabledServices: serviceusage_v1.Schema$GoogleApiServiceusageV1Service[] =
      [];

    await this.iterateServices(
      async (result) => {
        enabledServices.push(result);
        return Promise.resolve();
      },
      {
        filter: ServiceUsageListFilter.ENABLED,
      },
    );

    return enabledServices;
  }
}

/**
 * Example input: projects/PROJ_ID_NUM/services/appengine.googleapis.com
 * Example output: appengine.googleapis.com
 */
export function serviceResourceNameToServiceName(serviceResourceName: string) {
  const serviceParts = serviceResourceName.split('/');
  return serviceParts[serviceParts.length - 1];
}

export async function collectEnabledServicesForProject(
  config: IntegrationConfig,
  projectId: string,
  logger: IntegrationLogger,
): Promise<string[]> {
  const client = new ServiceUsageClient({ config, projectId }, logger);
  const enabledServices = await client.collectEnabledServices();
  return enabledServices.map((v) =>
    serviceResourceNameToServiceName(v.name as string),
  );
}
