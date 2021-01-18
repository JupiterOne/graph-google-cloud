import { bigquery_v2, google } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class BigQueryClient extends Client {
  private client = google.bigquery('v2');

  async iterateBigQueryDatasets(
    projectId: string,
    callback: (data: bigquery_v2.Schema$Dataset) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.datasets.list({
          auth,
          projectId,
          pageToken: nextPageToken,
        });
      },
      async (data: bigquery_v2.Schema$DatasetList) => {
        for (const datasetRef of data.datasets || []) {
          if (datasetRef?.datasetReference?.datasetId) {
            const dataset = await this.client.datasets.get({
              auth,
              projectId,
              datasetId: datasetRef.datasetReference?.datasetId,
            });

            await callback(dataset.data);
          }
        }
      },
    );
  }
}
