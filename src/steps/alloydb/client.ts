import { alloydb_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  AlloyDBPermissions,
  STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
  STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
} from './constants';

export class AlloyDBClient extends Client {
  private client = google.alloydb({ version: 'v1', retry: false });

  async iterateAlloyDBPostgreSQLClusters(
    callback: (data: alloydb_v1.Schema$Cluster) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.clusters.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}/locations/-`,
        });
      },
      async (data: alloydb_v1.Schema$ListClustersResponse) => {
        for (const item of data.clusters || []) {
          await callback(item);
        }
      },
      STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
      AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
    );
  }

  async iterateAlloyDBPostgreSQLInstances(
    clusterName,
    location,
    callback: (data: alloydb_v1.Schema$Instance) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.clusters.instances.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}/locations/${location}/clusters/${clusterName}`,
        });
      },
      async (data: alloydb_v1.Schema$ListInstancesResponse) => {
        for (const item of data.instances || []) {
          await callback(item);
        }
      },
      STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
      AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
    );
  }

  async iterateAlloyDBPostgreSQLUsers(
    clusterName,
    location,
    callback: (data: alloydb_v1.Schema$User) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    try {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.locations.clusters.users.list({
            auth,
            pageToken: nextPageToken,
            parent: `projects/${this.projectId}/locations/${location}/clusters/${clusterName}`,
          });
        },
        async (data: alloydb_v1.Schema$ListUsersResponse) => {
          for (const user of data.users || []) {
            await callback(user);
          }
        },
        STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
        AlloyDBPermissions.STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
      );
    } catch (error) {
      if (error.statusCode == 400) {
        // when cluster d'nt have primary instance we get 400
        return;
      }
    }
  }

  async iterateAlloyDBPostgreSQLConnectionInfo(
    location,
    clusterName,
    instanceName,
    callback: (data: alloydb_v1.Schema$ConnectionInfo) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async () => {
        return this.client.projects.locations.clusters.instances.getConnectionInfo(
          {
            auth,
            parent: `projects/${this.projectId}/locations/${location}/clusters/${clusterName}/instances/${instanceName}`,
          },
        );
      },
      async (data: alloydb_v1.Schema$ConnectionInfo) => {
        await callback(data);
      },
      STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
      AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
    );
  }

  async iterateAlloyDBPostgreSQLBackup(
    callback: (data: alloydb_v1.Schema$Backup) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.backups.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}/locations/-`,
        });
      },
      async (data: alloydb_v1.Schema$ListBackupsResponse) => {
        for (const item of data.backups || []) {
          await callback(item);
        }
      },
      STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
      AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
    );
  }
}
