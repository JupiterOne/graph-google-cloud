import { google, secretmanager_v1beta1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class SecretManagerClient extends Client {
  private client = google.secretmanager({ version: 'v1beta1' });

  async iterateSecrets(
    callback: (data: secretmanager_v1beta1.Schema$Secret) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.secrets.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}`,
        });
      },
      async (data: secretmanager_v1beta1.Schema$ListSecretsResponse) => {
        for (const secret of data.secrets || []) {
          await callback(secret);
        }
      },
    );
  }
}
