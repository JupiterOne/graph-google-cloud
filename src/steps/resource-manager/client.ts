import { Client } from '../../google-cloud/client';
import { google, cloudresourcemanager_v1 } from 'googleapis';

export interface PolicyMemberBinding {
  binding: cloudresourcemanager_v1.Schema$Binding;
  member: string;
}

export class ResourceManagerClient extends Client {
  private client = google.cloudresourcemanager('v1');

  async getProject() {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.get({
      auth,
      projectId: this.projectId,
    });

    return result.data;
  }

  async getOrganization() {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.organizations.get({
      auth,
      name: `organizations/${this.organizationId}`,
    });

    return result.data;
  }

  async getServiceAccountPolicy() {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.getIamPolicy({
      auth,
      resource: this.projectId,
      requestBody: {
        options: {
          // Policies are versioned and specifying this version will return
          // different data. The only way to fetch `conditions` on the
          // policies is to specify "3".
          //
          // See: https://cloud.google.com/iam/docs/reference/rest/v1/Policy
          requestedPolicyVersion: 3,
        },
      },
    });

    return result.data;
  }

  async iteratePolicyMemberBindings(
    callback: (data: PolicyMemberBinding) => Promise<void>,
  ) {
    const policy = await this.getServiceAccountPolicy();

    for (const binding of policy.bindings || []) {
      for (const member of binding.members || []) {
        await callback({
          binding,
          member,
        });
      }
    }
  }
}
