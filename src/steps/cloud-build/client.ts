import { cloudbuild_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class CloudBuildClient extends Client {
  private client = google.cloudbuild({ version: 'v1' });

  async iterateBuilds(
    callback: (data: cloudbuild_v1.Schema$Build) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.builds.list({
          auth,
          pageToken: nextPageToken,
          projectId: this.projectId,
        });
      },
      async (data: cloudbuild_v1.Schema$ListBuildsResponse) => {
        for (const build of data.builds || []) {
          await callback(build);
        }
      },
    );
  }

  async iterateBuildTriggers(
    callback: (data: cloudbuild_v1.Schema$BuildTrigger) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.triggers.list({
          auth,
          pageToken: nextPageToken,
          projectId: this.projectId,
        });
      },
      async (data: cloudbuild_v1.Schema$ListBuildTriggersResponse) => {
        for (const trigger of data.triggers || []) {
          await callback(trigger);
        }
      },
    );
  }
}
