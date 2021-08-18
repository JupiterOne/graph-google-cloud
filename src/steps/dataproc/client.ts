import { google, dataproc_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { googleCloudRegions } from '../../google-cloud/regions';

export class DataProcClient extends Client {
  private client = google.dataproc('v1');

  async iterateClusters(
    callback: (data: dataproc_v1.Schema$Cluster) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    for (const region of googleCloudRegions) {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.regions.clusters.list({
            auth,
            projectId: this.projectId,
            region: region.name,
            pageToken: nextPageToken,
          });
        },
        async (data: dataproc_v1.Schema$ListClustersResponse) => {
          for (const cluster of data.clusters || []) {
            await callback(cluster);
          }
        },
      );
    }
  }
}
