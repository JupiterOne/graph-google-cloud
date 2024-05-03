import { google, dataflow_v1b3 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  DataFlowPermissions,
  STEP_GOOGLE_CLOUD_DATAFLOW,

} from './constants';

export class dataFlowClient extends Client {
  private client = google.dataflow({ version: 'v1b3', retry: false });

  async iterateGoogleCloudDataFlowJob(
    callback: (data: dataflow_v1b3.Schema$Job) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.jobs.list({
          projectId: this.projectId,
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
  }
}
