import { google, dataflow_v1b3 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  DataFlowPermissions,
  STEP_GOOGLE_CLOUD_DATAFLOW,
} from './constants';
import { googleCloudRegions } from '../../google-cloud/regions'

export class dataFlowClient extends Client {
  private client = google.dataflow({ version: 'v1b3', retry: false });

  async iterateGoogleCloudDataFlowJob(
    callback: (data: dataflow_v1b3.Schema$Job) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    // Iterate over each region
    //for (const region of googleCloudRegions) {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.locations.jobs.list({
            projectId: this.projectId,
            location: 'us-east1',
            auth,
            pageToken: nextPageToken,
          });
        },
        async (data: dataflow_v1b3.Schema$ListJobsResponse) => {
          for (const job of data.jobs || []) {
            await callback(job);
          }
        },
        STEP_GOOGLE_CLOUD_DATAFLOW,
        DataFlowPermissions.STEP_GOOGLE_CLOUD_DATAFLOW_JOB,
      );
    //}
  }

  async iterateGoogleCloudDataFlowSnapshot(
    callback: (data: dataflow_v1b3.Schema$Snapshot) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    // Iterate over each region
    for (const region of googleCloudRegions) {
      await this.iterateApi(
        async () => {
          const req=await this.client.projects.locations.snapshots.list({
            projectId: this.projectId,
            location: region.name,
            auth,
          });
          console.log(req+" .........................")
          return req
        },
        async (data: dataflow_v1b3.Schema$ListSnapshotsResponse) => {
          for (const snapshot of data.snapshots || []) {
            await callback(snapshot);
          }
        },
        STEP_GOOGLE_CLOUD_DATAFLOW,
        DataFlowPermissions.STEP_GOOGLE_CLOUD_DATAFLOW_JOB,
      );
    }
  }
}
