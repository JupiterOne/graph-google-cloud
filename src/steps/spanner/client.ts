import { google, spanner_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  STEP_SPANNER_BACKUP,
  STEP_SPANNER_INSTANCES,
  STEP_SPANNER_INSTANCE_CONFIGS,
  STEP_SPANNER_INSTANCE_DATABASES,
  STEP_SPANNER_INSTANCE_DATABASES_ROLE,
  SpannerPermissions,
} from './constants';

export class SpannerClient extends Client {
  private client = google.spanner({ version: 'v1', retry: false });

  async getInstancePolicy(
    instanceId: string,
  ): Promise<spanner_v1.Schema$Policy | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.withErrorHandling(
      () =>
        this.client.projects.instances.getIamPolicy({
          resource: `projects/${this.projectId}/instances/${instanceId}`,
          auth,
        }),
      this.logger,
      {
        stepId: STEP_SPANNER_INSTANCE_DATABASES,
        suggestedPermissions:
          SpannerPermissions.STEP_SPANNER_INSTANCE_DATABASES,
      },
    );

    return result?.data;
  }

  async getDatabasePolicy(
    instanceId: string,
    databaseId: string,
  ): Promise<spanner_v1.Schema$Policy | undefined> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.withErrorHandling(
      () =>
        this.client.projects.instances.databases.getIamPolicy({
          resource: `projects/${this.projectId}/instances/${instanceId}/databases/${databaseId}`,
          auth,
        }),
      this.logger,
      {
        stepId: STEP_SPANNER_INSTANCE_DATABASES,
        suggestedPermissions:
          SpannerPermissions.STEP_SPANNER_INSTANCE_DATABASES,
      },
    );

    return result?.data;
  }

  async iterateInstances(
    callback: (data: spanner_v1.Schema$Instance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.instances.list({
          auth,
          parent: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: spanner_v1.Schema$ListInstancesResponse) => {
        for (const instance of data.instances || []) {
          await callback(instance);
        }
      },
      STEP_SPANNER_INSTANCES,
      SpannerPermissions.STEP_SPANNER_INSTANCES,
    );
  }

  async iterateInstanceConfigs(
    callback: (data: spanner_v1.Schema$InstanceConfig) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.instanceConfigs.list({
          auth,
          parent: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: spanner_v1.Schema$ListInstanceConfigsResponse) => {
        for (const instanceConfig of data.instanceConfigs || []) {
          await callback(instanceConfig);
        }
      },
      STEP_SPANNER_INSTANCE_CONFIGS,
      SpannerPermissions.STEP_SPANNER_INSTANCE_CONFIGS,
    );
  }

  async iterateInstanceDatabases(
    spannerId: string,
    callback: (data: spanner_v1.Schema$Database) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.instances.databases.list({
          auth,
          parent: `projects/${this.projectId}/instances/${spannerId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: spanner_v1.Schema$ListDatabasesResponse) => {
        for (const database of data.databases || []) {
          await callback(database);
        }
      },
      STEP_SPANNER_INSTANCE_DATABASES,
      SpannerPermissions.STEP_SPANNER_INSTANCE_DATABASES,
    );
  }

  async iterateInstanceDatabasesRoles(
    instanceId: string,
    databaseId: string,
    callback: (data: spanner_v1.Schema$DatabaseRole) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.instances.databases.databaseRoles.list({
          auth,
          parent: `projects/${this.projectId}/instances/${instanceId}/databases/${databaseId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: spanner_v1.Schema$ListDatabaseRolesResponse) => {
        for (const databaseRole of data.databaseRoles || []) {
          await callback(databaseRole);
        }
      },
      STEP_SPANNER_INSTANCE_DATABASES_ROLE,
      SpannerPermissions.STEP_SPANNER_INSTANCE_DATABASES_ROLE,
    );
  }

  async iterateSpannerBackup(
    instanceName: string,
    callback: (data: spanner_v1.Schema$Backup) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    try {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.instances.backups.list({
            auth,
            parent: `projects/${this.projectId}/instances/${instanceName}`,
            pageToken: nextPageToken,
          });
        },
        async (data: spanner_v1.Schema$ListBackupsResponse) => {
          for (const backup of data.backups || []) {
            await callback(backup);
          }
        },
        STEP_SPANNER_BACKUP,
        SpannerPermissions.STEP_SPANNER_INSTANCE_BACKUP,
      );
    } catch (err) {
      if (err.status == 404) {
        this.logger.warn('No backup available');
      }
    }
  }
}
