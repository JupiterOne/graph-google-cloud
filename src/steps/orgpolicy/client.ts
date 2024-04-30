import { google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { StoragePermissions, StorageStepsSpec } from '../storage/constants';

export class OrgPolicyClient extends Client {
  private client = google.orgpolicy({ version: 'v2', retry: false });

  async fetchOrganizationPublicAccessPreventionPolicy(): Promise<
    boolean | undefined
  > {
    const auth = await this.getAuthenticatedServiceClient();
    const resp = await this.withErrorHandling(
      () =>
        this.client.projects.policies.getEffectivePolicy({
          name: `projects/${this.projectId}/policies/storage.publicAccessPrevention`,
          auth,
        }),
      this.logger,
      {
        stepId: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
        suggestedPermissions: StoragePermissions.FETCH_STORAGE_BUCKETS,
      },
    );

    if (resp?.data && resp.data.spec?.rules) {
      return resp.data.spec?.rules[0].enforce as boolean;
    }
  }
}
