import { google, orgpolicy_v2 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class OrgPolicyClient extends Client {
  private client = google.orgpolicy('v2');

  async iterateOrganizationPolicies(
    parent: string,
    callback: (
      data: orgpolicy_v2.Schema$GoogleCloudOrgpolicyV2Policy,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.organizations.policies.list({
          parent,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (
        data: orgpolicy_v2.Schema$GoogleCloudOrgpolicyV2ListPoliciesResponse,
      ) => {
        for (const policy of data.policies || []) {
          await callback(policy);
        }
      },
    );
  }
}
