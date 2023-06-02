import { google, storage_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class CloudStorageClient extends Client {
  private client = google.storage({ version: 'v1', retry: false });

  async iterateCloudStorageBuckets(
    callback: (data: storage_v1.Schema$Bucket) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.buckets.list({
          project: this.projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: storage_v1.Schema$Buckets) => {
        await this.executeConcurrently(data.items, callback);
      },
    );
  }

  async getPolicy(bucket: string): Promise<storage_v1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.buckets.getIamPolicy({
      auth,
      bucket,
    });

    return result.data;
  }
}
