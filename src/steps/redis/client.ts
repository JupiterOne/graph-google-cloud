import { google, redis_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class RedisClient extends Client {
  private client = google.redis({ version: 'v1', retry: false });

  async iterateRedisInstances(
    callback: (data: redis_v1.Schema$Instance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.instances.list({
          auth,
          parent: `projects/${this.projectId}/locations/-`,
          pageToken: nextPageToken,
        });
      },
      async (data: redis_v1.Schema$ListInstancesResponse) => {
        for (const instance of data.instances || []) {
          await callback(instance);
        }
      },
    );
  }
}
