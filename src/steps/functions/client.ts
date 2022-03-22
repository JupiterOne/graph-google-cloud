import { google, cloudfunctions_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export function createCloudFunctionClientMapper(
  callback: (data: cloudfunctions_v1.Schema$CloudFunction) => Promise<void>,
) {
  return async (data: cloudfunctions_v1.Schema$ListFunctionsResponse) => {
    for (const cloudFunction of data.functions || []) {
      await callback(cloudFunction);
    }
  };
}

export class CloudFunctionsClient extends Client {
  private client = google.cloudfunctions({ version: 'v1', retry: false });

  async iterateCloudFunctions(
    callback: (data: cloudfunctions_v1.Schema$CloudFunction) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(async (nextPageToken) => {
      return this.client.projects.locations.functions.list({
        parent: `projects/${this.projectId}/locations/-`,
        auth,
        pageToken: nextPageToken,
      });
    }, createCloudFunctionClientMapper(callback));
  }
}
