import { Client } from '../../google-cloud/client';
import { google, cloudresourcemanager_v3 } from 'googleapis';

export interface PolicyMemberBinding {
  binding: cloudresourcemanager_v3.Schema$Binding;
  member: string;
}

function shouldSkipProject(projectId: string) {
  return projectId.startsWith('sys-');
}

export class ResourceManagerClient extends Client {
  private client = google.cloudresourcemanager({ version: 'v3', retry: false });

  async getProject() {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.get({
      auth,
      name: `projects/${this.projectId}`,
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

  async iterateFolders(
    callback: (data: cloudresourcemanager_v3.Schema$Folder) => Promise<void>,
    folderName?: string,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.folders.list({
          auth,
          parent: folderName || `organizations/${this.organizationId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: cloudresourcemanager_v3.Schema$ListFoldersResponse) => {
        for (const folder of data.folders || []) {
          await callback(folder);
        }
      },
    );
  }

  async iterateProjects(
    callback: (data: cloudresourcemanager_v3.Schema$Project) => Promise<void>,
    folderName?: string,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.list({
          auth,
          parent: folderName || `organizations/${this.organizationId}`,
          showDeleted: true, // We need to pull deleted projects so we can 1. map iam_bindings and 2. set the project.state to "DELETED" as soon as possible.
          pageToken: nextPageToken,
        });
      },
      async (data: cloudresourcemanager_v3.Schema$ListProjectsResponse) => {
        for (const project of data.projects || []) {
          if (shouldSkipProject(project.projectId!)) {
            return;
          }
          await callback(project);
        }
      },
    );
  }

  async getServiceAccountPolicy() {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.getIamPolicy({
      auth,
      resource: `projects/${this.projectId}`,
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

  async iteratePolicyAuditConfigs(
    callback: (
      data: cloudresourcemanager_v3.Schema$AuditConfig,
    ) => Promise<void>,
  ) {
    const policy = await this.getServiceAccountPolicy();
    for (const auditConfig of policy.auditConfigs || []) {
      await callback(auditConfig);
    }
  }
}
