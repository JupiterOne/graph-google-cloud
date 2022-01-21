import { google, cloudscheduler_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class CloudSchedulerClient extends Client {
  private client = google.cloudscheduler('v1');

  private async iterateProjectLocations(
    callback: (data: cloudscheduler_v1.Schema$Location) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.list({
          auth,
          pageToken: nextPageToken,
          name: `projects/${this.projectId}`,
        });
      },
      async (data) => {
        for (const item of data.locations || []) {
          await callback(item);
        }
      },
    );
  }

  async iterateCloudSchedulerJobs(
    callback: (data: cloudscheduler_v1.Schema$Job) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateProjectLocations(async (location) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.locations.jobs.list({
            auth,
            pageToken: nextPageToken,
            parent: `projects/${this.projectId}/locations/${location.locationId}`,
          });
        },
        async (data) => {
          for (const item of data.jobs || []) {
            await callback(item);
          }
        },
      );
    });
  }
}
