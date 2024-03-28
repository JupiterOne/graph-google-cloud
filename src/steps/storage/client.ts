import { google, storage_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { StoragePermissions, StorageStepsSpec } from './constants';

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
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      StoragePermissions.FETCH_STORAGE_BUCKETS,
    );
  }

  async getPolicy(
    bucket: string,
  ): Promise<storage_v1.Schema$Policy | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.withErrorHandling(
      () =>
        this.client.buckets.getIamPolicy({
          auth,
          bucket,
        }),
      this.logger,
      {
        stepId: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
        suggestedPermissions: StoragePermissions.FETCH_STORAGE_BUCKETS,
      },
    );

    return result?.data;
  }
}
