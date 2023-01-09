import { google, websecurityscanner_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class WebSecurityScannerClient extends Client {
  private client = google.websecurityscanner({ version: 'v1' });

  async iterateScanConfigs(
    callback: (data: websecurityscanner_v1.Schema$ScanConfig) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      (nextPageToken) => {
        return this.client.projects.scanConfigs.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}`,
        });
      },
      async (data: websecurityscanner_v1.Schema$ListScanConfigsResponse) => {
        for (const scanConfig of data.scanConfigs || []) {
          await callback(scanConfig);
        }
      },
    );
  }

  async iterateScanRuns(
    parentScanConfigName: string,
    callback: (data: websecurityscanner_v1.Schema$ScanRun) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      (nextPageToken) => {
        return this.client.projects.scanConfigs.scanRuns.list({
          auth,
          pageToken: nextPageToken,
          parent: parentScanConfigName,
        });
      },
      async (data: websecurityscanner_v1.Schema$ListScanRunsResponse) => {
        for (const scanRun of data.scanRuns || []) {
          await callback(scanRun);
        }
      },
    );
  }

  async iterateScanRunFindings(
    parentScanRunName: string,
    callback: (data: websecurityscanner_v1.Schema$Finding) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      (nextPageToken) => {
        return this.client.projects.scanConfigs.scanRuns.findings.list({
          auth,
          pageToken: nextPageToken,
          parent: parentScanRunName,
          filter: 'findingType=XSS',
        });
      },
      async (data: websecurityscanner_v1.Schema$ListFindingsResponse) => {
        for (const scanRun of data.findings || []) {
          await callback(scanRun);
        }
      },
    );
  }
}
