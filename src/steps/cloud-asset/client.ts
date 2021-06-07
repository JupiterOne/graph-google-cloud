import { google, cloudasset_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { IntegrationStepContext } from '../../types';

export class CloudAssetClient extends Client {
  private client = google.cloudasset('v1');

  async iterateAllIamPolicies(
    context: IntegrationStepContext,
    callback: (
      data: cloudasset_v1.Schema$IamPolicySearchResult,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return await this.client.v1.searchAllIamPolicies({
          auth,
          pageSize: 500, // 500 is the max
          pageToken: nextPageToken,
          scope: `organizations/${context.instance.config.organizationId}`,
        });
      },
      async (data: cloudasset_v1.Schema$SearchAllIamPoliciesResponse) => {
        for (const policyResult of data.results || []) {
          await callback(policyResult);
        }
      },
    );
  }
}
