import { IntegrationError } from '@jupiterone/integration-sdk-core';
import { google, cloudasset_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { IntegrationStepContext } from '../../types';
import { isMasterOrganizationInstance } from '../../utils/isMasterOrganizationInstance';
import { isSingleProjectInstance } from '../../utils/isSingleProjectInstance';

export class CloudAssetClient extends Client {
  private client = google.cloudasset('v1');

  async iterateAllIamPolicies(
    context: IntegrationStepContext,
    callback: (
      data: cloudasset_v1.Schema$IamPolicySearchResult,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    const { config } = context.instance;
    const { organizationId, projectId } = config;

    let scope: string | undefined;
    if (isMasterOrganizationInstance(config)) {
      scope = `organizations/${organizationId}`;
    } else if (isSingleProjectInstance(config)) {
      scope = `projects/${projectId}`;
    }

    if (!scope) {
      // This error should never be thrown because the step should have been turned off in getStepStartStates.ts
      throw new IntegrationError({
        message:
          'IAM Bindings should not be fetched for this integration instance.',
        code: 'UNEXPECTED_ERROR',
      });
    }

    await this.iterateApi(
      async (nextPageToken) => {
        return await this.client.v1.searchAllIamPolicies({
          auth,
          pageSize: 500, // 500 is the max
          pageToken: nextPageToken,
          scope,
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
