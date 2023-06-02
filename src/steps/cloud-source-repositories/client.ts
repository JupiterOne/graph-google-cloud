import { google, sourcerepo_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
export class CloudSourceRepositoriesClient extends Client {
  private client = google.sourcerepo({ version: 'v1' });

  async iterateRepositories(
    callback: (data: sourcerepo_v1.Schema$Repo) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      (nextPageToken) => {
        return this.client.projects.repos.list({
          auth,
          pageToken: nextPageToken,
          name: `projects/${this.projectId}`,
        });
      },
      async (data: sourcerepo_v1.Schema$ListReposResponse) => {
        for (const build of data.repos || []) {
          await callback(build);
        }
      },
    );
  }
}
