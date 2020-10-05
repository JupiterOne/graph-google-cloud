import { google, compute_v1 } from 'googleapis';
import {
  Client,
  PageableGaxiosResponse,
  GoogleClientAuth,
} from '../../google-cloud/client';
import {
  googleCloudRegions,
  iterateRegionZones,
} from '../../google-cloud/regions';

export class ComputeClient extends Client {
  private client = google.compute('v1');

  private async iterateComputeApi<T>(
    fn: (params: {
      auth: GoogleClientAuth;
      zone: string;
      nextPageToken?: string;
    }) => Promise<PageableGaxiosResponse<T>>,
    callback: (data: T) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegionZones(async (zone) => {
      await this.iterateApi(
        async (nextPageToken) => fn({ auth, zone, nextPageToken }),
        callback,
      );
    });
  }

  async iterateComputeDisks(
    callback: (data: compute_v1.Schema$Disk) => Promise<void>,
  ) {
    await this.iterateComputeApi(
      async ({ auth, zone, nextPageToken }) => {
        return this.client.disks.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
          zone,
        });
      },
      async (data: compute_v1.Schema$DiskList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
    );
  }

  async iterateComputeInstances(
    callback: (data: compute_v1.Schema$Instance) => Promise<void>,
  ): Promise<void> {
    await this.iterateComputeApi(
      async ({ auth, zone, nextPageToken }) => {
        return this.client.instances.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
          zone,
        });
      },
      async (data: compute_v1.Schema$InstanceList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
    );
  }

  async iterateFirewalls(
    callback: (data: compute_v1.Schema$Firewall) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.firewalls.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$FirewallList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
    );
  }

  async iterateSubnetworks(
    callback: (data: compute_v1.Schema$Subnetwork) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    for (const region of googleCloudRegions) {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.subnetworks.list({
            auth,
            pageToken: nextPageToken,
            project: this.projectId,
            region: region.name,
          });
        },
        async (data: compute_v1.Schema$NetworkList) => {
          for (const item of data.items || []) {
            await callback(item);
          }
        },
      );
    }
  }

  async iterateNetworks(
    callback: (data: compute_v1.Schema$Network) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.networks.list({
          auth,
          pageToken: nextPageToken,
          project: this.projectId,
        });
      },
      async (data: compute_v1.Schema$NetworkList) => {
        for (const item of data.items || []) {
          await callback(item);
        }
      },
    );
  }
}
