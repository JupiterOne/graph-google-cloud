/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { bigquery_v2, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  BigQueryPermissions,
  STEP_BIG_QUERY_DATASETS,
  STEP_BIG_QUERY_MODELS,
  STEP_BIG_QUERY_TABLES,
} from './constants';

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
  private client = google.bigquery({ version: 'v2', retry: false });

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
          await this.executeConcurrently(data.tables, callback);
        }
      },
      STEP_BIG_QUERY_TABLES,
      BigQueryPermissions.STEP_BIG_QUERY_TABLES,
    );
  }

  async getTablePolicy(
    data: BigQueryTable,
  ): Promise<bigquery_v2.Schema$Policy | undefined> {
    const auth = await this.getAuthenticatedServiceClient();
    const { projectId, datasetId, tableId } = data.tableReference ?? {};
    if (!projectId || !datasetId || !tableId) {
      return undefined;
    }
    const policyResponse = await this.withErrorHandling(
      () =>
        this.client.tables.getIamPolicy({
          auth,
          resource: `projects/${projectId}/datasets/${datasetId}/tables/${tableId}`,
        }),
      this.logger,
      {
        stepId: STEP_BIG_QUERY_TABLES,
        suggestedPermissions: BigQueryPermissions.STEP_BIG_QUERY_TABLES,
      },
    );
    return policyResponse?.data;
  }

  async getTableResource(
    data: BigQueryTable,
  ): Promise<bigquery_v2.Schema$Table | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const resp = await this.withErrorHandling(
      () =>
        this.client.tables.get({
          auth,
          projectId: data.tableReference?.projectId!,
          datasetId: data.tableReference?.datasetId!,
          tableId: data.tableReference?.tableId!,
        }),
      this.logger,
      {
        stepId: STEP_BIG_QUERY_TABLES,
        suggestedPermissions: BigQueryPermissions.STEP_BIG_QUERY_TABLES,
      },
    );

    return resp?.data;
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
            const dataset = await this.withErrorHandling(
              () =>
                this.client.datasets.get({
                  auth,
                  projectId: this.projectId,
                  datasetId: datasetRef.datasetReference?.datasetId as string,
                }),
              this.logger,
              {
                stepId: STEP_BIG_QUERY_DATASETS,
                suggestedPermissions:
                  BigQueryPermissions.STEP_BIG_QUERY_DATASETS,
              },
            );

            if (dataset) {
              await callback(dataset.data);
            }
          }
        }
      },
      STEP_BIG_QUERY_DATASETS,
      BigQueryPermissions.STEP_BIG_QUERY_DATASETS,
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
            const model = await this.withErrorHandling(
              () =>
                this.client.models.get({
                  auth,
                  projectId: this.projectId,
                  datasetId: datasetId,
                  modelId: modelRef.modelReference?.modelId as string,
                }),
              this.logger,
              {
                stepId: STEP_BIG_QUERY_MODELS,
                suggestedPermissions: BigQueryPermissions.STEP_BIG_QUERY_MODELS,
              },
            );
            if (model) {
              await callback(model.data);
            }
          }
        }
      },
      STEP_BIG_QUERY_MODELS,
      BigQueryPermissions.STEP_BIG_QUERY_MODELS,
    );
  }
}
