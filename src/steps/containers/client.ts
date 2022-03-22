import { google, container_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class ContainerClient extends Client {
  private client = google.container({ version: 'v1', retry: false });

  async iterateClusters(
    callback: (data: container_v1.Schema$Cluster) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.locations.clusters.list({
      auth,
      parent: `projects/${this.projectId}/locations/-`,
    });

    for (const cluster of result.data.clusters || []) {
      await callback(cluster);
    }
  }
}
