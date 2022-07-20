import { google, dataproc_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { iterateRegions } from '../../google-cloud/regions';

export class DataProcClient extends Client {
  private client = google.dataproc({ version: 'v1', retry: false });

  async iterateClusters(
    callback: (data: dataproc_v1.Schema$Cluster) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.regions.clusters.list({
            auth,
            projectId: this.projectId,
            region: region,
            pageToken: nextPageToken,
          });
        },
        async (data: dataproc_v1.Schema$ListClustersResponse) => {
          for (const cluster of data.clusters || []) {
            await callback(cluster);
          }
        },
      );
    });
  }
}
