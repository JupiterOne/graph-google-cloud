import { google, billingbudgets_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class BillingBudgetClient extends Client {
  private client = google.billingbudgets({ version: 'v1', retry: false });

  async iterateBudgets(
    billingAccountId: string,
    callback: (
      data: billingbudgets_v1.Schema$GoogleCloudBillingBudgetsV1Budget,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.billingAccounts.budgets.list({
          auth,
          parent: billingAccountId,
          pageToken: nextPageToken,
        });
      },
      async (
        data: billingbudgets_v1.Schema$GoogleCloudBillingBudgetsV1ListBudgetsResponse,
      ) => {
        for (const budget of data.budgets || []) {
          await callback(budget);
        }
      },
    );
  }
}
