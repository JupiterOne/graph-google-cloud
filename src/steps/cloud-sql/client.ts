import { google, sqladmin_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  CloudSqlPermissions,
  STEP_CLOUD_SQL_BACKUP,
  STEP_CLOUD_SQL_CONNECTION,
  STEP_CLOUD_SQL_DATABASE,
  STEP_CLOUD_SQL_INSTANCES,
  STEP_CLOUD_SQL_SSL_CERTIFICATION,
  STEP_CLOUD_USER,
} from './constants';

export class CloudSqlClient extends Client {
  private client = google.sqladmin({ version: 'v1' }); // Initialize as SQL Admin client

  async iterateCloudSqlInstances(
    callback: (data: sqladmin_v1.Schema$InstancesListResponse) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.instances.list({
          project: this.projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: sqladmin_v1.Schema$InstancesListResponse) => {
        for (const instance of data.items || []) {
          await callback(instance);
        }
      },
      STEP_CLOUD_SQL_INSTANCES,
      CloudSqlPermissions.STEP_CLOUD_SQL_INSTANCES,
    );
  }

  async iterateCloudSslCertification(
    instanceName,
    callback: (data: sqladmin_v1.Schema$SslCertsListResponse) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        return this.client.sslCerts.list({
          project: this.projectId,
          instance: instanceName,
          auth,
        });
      },
      async (data: sqladmin_v1.Schema$SslCertsListResponse) => {
        for (const sslCert of data.items || []) {
          await callback(sslCert);
        }
      },
      STEP_CLOUD_SQL_SSL_CERTIFICATION,
      CloudSqlPermissions.STEP_CLOUD_SQL_SSL_CERTIFICATION,
    );
  }

  async iterateCloudSqlBackup(
    instanceName,
    callback: (
      data: sqladmin_v1.Schema$BackupRunsListResponse,
    ) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        return this.client.backupRuns.list({
          project: this.projectId,
          instance: instanceName,
          auth,
        });
      },
      async (data: sqladmin_v1.Schema$BackupRunsListResponse) => {
        for (const backup of data.items || []) {
          await callback(backup);
        }
      },
      STEP_CLOUD_SQL_BACKUP,
      CloudSqlPermissions.STEP_CLOUD_SQL_BACKUP,
    );
  }

  async iterateCloudSqlConnection(
    instanceName,
    callback: (data: sqladmin_v1.Schema$ConnectSettings) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        return this.client.connect.get({
          project: this.projectId,
          instance: instanceName,
          auth,
        });
      },
      async (data: sqladmin_v1.Schema$ConnectSettings) => {
        await callback(data);
      },
      STEP_CLOUD_SQL_CONNECTION,
      CloudSqlPermissions.STEP_CLOUD_SQL_CONNECTION,
    );
  }

  async iterateCloudSqlDatabase(
    instanceName,
    callback: (data: sqladmin_v1.Schema$DatabasesListResponse) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        return this.client.databases.list({
          project: this.projectId,
          instance: instanceName,
          auth,
        });
      },
      async (data: sqladmin_v1.Schema$BackupRunsListResponse) => {
        for (const database of data.items || []) {
          await callback(database);
        }
      },
      STEP_CLOUD_SQL_DATABASE,
      CloudSqlPermissions.STEP_CLOUD_SQL_DATABASE,
    );
  }

  async iterateCloudUser(
    instanceName,
    callback: (data: sqladmin_v1.Schema$UsersListResponse) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async () => {
        return this.client.users.list({
          project: this.projectId,
          instance: instanceName,
          auth,
        });
      },
      async (data: sqladmin_v1.Schema$UsersListResponse) => {
        for (const database of data.items || []) {
          await callback(database);
        }
      },
      STEP_CLOUD_USER,
      CloudSqlPermissions.STEP_CLOUD_USER,
    );
  }
}
