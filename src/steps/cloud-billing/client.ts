import { google, cloudbilling_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { CloudBillingPermissions, STEP_BILLING_ACCOUNTS } from './constants';
import {
  BillingBudgetsPermissions,
  STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
} from '../billing-budgets/constants';

export class CloudBillingClient extends Client {
  private client = google.cloudbilling({ version: 'v1', retry: false });

  async iterateBillingAccounts(
    callback: (data: cloudbilling_v1.Schema$BillingAccount) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.billingAccounts.list({
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: cloudbilling_v1.Schema$ListBillingAccountsResponse) => {
        for (const billingAccount of data.billingAccounts || []) {
          await callback(billingAccount);
        }
      },
      STEP_BILLING_ACCOUNTS,
      CloudBillingPermissions.STEP_BILLING_ACCOUNTS,
    );
  }

  async iterateBillingAccountProjects(
    billingAccountId: string,
    callback: (
      data: cloudbilling_v1.Schema$ProjectBillingInfo,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.billingAccounts.projects.list({
          auth,
          name: billingAccountId,
          pageToken: nextPageToken,
        });
      },
      async (data: cloudbilling_v1.Schema$ListProjectBillingInfoResponse) => {
        for (const project of data.projectBillingInfo || []) {
          await callback(project);
        }
      },
      STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
      BillingBudgetsPermissions.STEP_BUILD_ADDITIONAL_PROJECT_BUDGET,
    );
  }
}
