import { cloudbuild_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { CloudBuildLocations } from './constants';

export class CloudBuildClient extends Client {
  private client = google.cloudbuild({ version: 'v1' });

  private async iterateLocations(callback: (region: string) => Promise<void>) {
    for (const region of CloudBuildLocations) {
      await callback(region);
    }
  }

  async iterateBuilds(
    callback: (data: cloudbuild_v1.Schema$Build) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      (nextPageToken) => {
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
      (nextPageToken) => {
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

  async iterateBuildWorkerPools(
    callback: (data: cloudbuild_v1.Schema$WorkerPool) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateLocations(async (region) => {
      await this.iterateApi(
        (nextPageToken) => {
          return this.client.projects.locations.workerPools.list({
            auth,
            pageToken: nextPageToken,
            parent: `projects/${this.projectId}/locations/${region}`,
          });
        },
        async (data: cloudbuild_v1.Schema$ListWorkerPoolsResponse) => {
          for (const pool of data.workerPools || []) {
            await callback(pool);
          }
        },
      );
    });
  }

  async iterateBuildsGheConfigs(
    callback: (
      data: cloudbuild_v1.Schema$GitHubEnterpriseConfig,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    const res = await this.client.projects.githubEnterpriseConfigs.list({
      auth,
      parent: `projects/${this.projectId}`,
    });

    if (res.data?.configs) {
      for (const config of res.data.configs) {
        await callback(config);
      }
    }
  }
}
