import { bigquery_v2, google } from 'googleapis';
import { Client } from '../../google-cloud/client';

// googleapis is missing a type for this
export type BigQueryTable = {
  clustering?: bigquery_v2.Schema$Clustering;
  creationTime?: string;
  expirationTime?: string;
  friendlyName?: string;
  id?: string;
  kind?: string;
  labels?: {
    [key: string]: string;
  };
  rangePartitioning?: bigquery_v2.Schema$RangePartitioning;
  tableReference?: bigquery_v2.Schema$TableReference;
  timePartitioning?: bigquery_v2.Schema$TimePartitioning;
  type?: string;
  view?: {
    useLegacySql?: boolean;
  };
};

export class BigQueryClient extends Client {
  private client = google.bigquery('v2');

  async iterateBigQueryTables(
    datasetId: string,
    callback: (data: BigQueryTable) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.tables.list({
          auth,
          datasetId,
          pageToken: nextPageToken,
          projectId: this.projectId,
        });
      },
      async (data: bigquery_v2.Schema$TableList) => {
        if (data.tables) {
          for (const table of data.tables) {
            await callback(table);
          }
        }
      },
    );
  }

  async getTablePolicy(
    data: BigQueryTable,
  ): Promise<bigquery_v2.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.client.tables.getIamPolicy({
      auth,
      resource: `projects/${data.tableReference?.projectId}/datasets/${data.tableReference?.datasetId}/tables/${data.tableReference?.tableId}`,
    });

    return resp.data;
  }

  async getTableResource(
    data: BigQueryTable,
  ): Promise<bigquery_v2.Schema$Table> {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.client.tables.get({
      auth,
      projectId: data.tableReference?.projectId || '',
      datasetId: data.tableReference?.datasetId || '',
      tableId: data.tableReference?.tableId || '',
    });

    return resp.data;
  }

  async iterateBigQueryDatasets(
    callback: (data: bigquery_v2.Schema$Dataset) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.datasets.list({
          auth,
          projectId: this.projectId,
          pageToken: nextPageToken,
        });
      },
      async (data: bigquery_v2.Schema$DatasetList) => {
        for (const datasetRef of data.datasets || []) {
          if (datasetRef?.datasetReference?.datasetId) {
            const dataset = await this.client.datasets.get({
              auth,
              projectId: this.projectId,
              datasetId: datasetRef.datasetReference?.datasetId,
            });

            await callback(dataset.data);
          }
        }
      },
    );
  }

  async iterateBigQueryModels(
    datasetId: string,
    callback: (data: bigquery_v2.Schema$Model) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.models.list({
          auth,
          datasetId,
          projectId: this.projectId,
          pageToken: nextPageToken,
        });
      },
      async (data: bigquery_v2.Schema$ListModelsResponse) => {
        for (const modelRef of data.models || []) {
          if (modelRef.modelReference?.modelId) {
            const model = await this.client.models.get({
              auth,
              projectId: this.projectId,
              datasetId,
              modelId: modelRef.modelReference.modelId,
            });
            await callback(model.data);
          }
        }
      },
    );
  }
}
