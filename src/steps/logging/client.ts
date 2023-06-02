import { google, logging_v2 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class LoggingClient extends Client {
  private client = google.logging({ version: 'v2', retry: false });

  async iterateProjectSinks(
    callback: (data: logging_v2.Schema$LogSink) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.sinks.list({
          auth,
          parent: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: logging_v2.Schema$ListSinksResponse) => {
        for (const logSink of data.sinks || []) {
          await callback(logSink);
        }
      },
    );
  }

  async iterateMetrics(
    callback: (data: logging_v2.Schema$LogMetric) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.metrics.list({
          auth,
          parent: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: logging_v2.Schema$ListLogMetricsResponse) => {
        for (const metric of data.metrics || []) {
          await callback(metric);
        }
      },
    );
  }
}
