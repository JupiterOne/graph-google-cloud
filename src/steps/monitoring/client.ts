import { google, monitoring_v3 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  MonitoringPermissions,
  STEP_MONITORING_ALERT_POLICIES,
} from './constants';

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
      STEP_MONITORING_ALERT_POLICIES,
      MonitoringPermissions.STEP_MONITORING_ALERT_POLICIES,
    );
  }
}
