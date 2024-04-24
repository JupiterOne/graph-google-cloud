import { google, monitoring_v3 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class MonitoringClient extends Client {
  private client = google.monitoring({ version: 'v3', retry: false });

  async iterateAlertPolicies(
    callback: (data: monitoring_v3.Schema$AlertPolicy) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.alertPolicies.list({
          auth,
          name: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: monitoring_v3.Schema$ListAlertPoliciesResponse) => {
        for (const alertPolicy of data.alertPolicies || []) {
          await callback(alertPolicy);
        }
      },
    );
  }

  async iterateChannels(
    callback: (data: monitoring_v3.Schema$NotificationChannel) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.notificationChannels.list({
          auth,
          name: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: monitoring_v3.Schema$ListNotificationChannelsResponse) => {
        for (const channel of data.notificationChannels || []) {
          await callback(channel);
        }
      },
    );
  }

  async iterateGroups(
    callback: (data: monitoring_v3.Schema$Group) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.groups.list({
          auth,
          name: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: monitoring_v3.Schema$ListGroupsResponse) => {
        for (const Group of data.group || []) {
          await callback(Group);
        }
      },
    );
  }
}
