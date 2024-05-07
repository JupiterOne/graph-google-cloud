import { cloudbuild_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { IntegrationStepContext } from '../../types';
import {
  CloudBuildLocations,
  CloudBuildPermissions,
  CloudBuildStepsSpec,
} from './constants';

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
      CloudBuildStepsSpec.FETCH_BUILDS.id,
      CloudBuildPermissions.FETCH_BUILDS,
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
      CloudBuildStepsSpec.FETCH_BUILD_TRIGGERS.id,
      CloudBuildPermissions.FETCH_BUILD_TRIGGERS,
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
        CloudBuildStepsSpec.FETCH_BUILD_WORKER_POOLS.id,
        CloudBuildPermissions.FETCH_BUILD_WORKER_POOLS,
      );
    });
  }

  async iterateBuildsGheConfigs(
    callback: (
      data: cloudbuild_v1.Schema$GitHubEnterpriseConfig,
    ) => Promise<void>,
    context: IntegrationStepContext,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    try {
      const res = await this.withErrorHandling(
        () =>
          this.client.projects.githubEnterpriseConfigs.list({
            auth,
            parent: `projects/${this.projectId}`,
          }),
        this.logger,
        {
          stepId: CloudBuildStepsSpec.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG.id,
          suggestedPermissions:
            CloudBuildPermissions.FETCH_BUILD_GITHUB_ENTERPRISE_CONFIG,
        },
      );

      if (res?.data?.configs) {
        for (const config of res.data.configs) {
          await callback(config);
        }
      }
    } catch (err) {
      context.logger.error(
        'Error getting the Github Enterprise Configs for Cloud Build.',
      );
    }
  }

  async iterateBuildsBitbucketServerConfigs(
    callback: (
      data: cloudbuild_v1.Schema$BitbucketServerConfig,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      (nextPageToken) => {
        return this.client.projects.locations.bitbucketServerConfigs.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}/locations/global`,
        });
      },
      async (data: cloudbuild_v1.Schema$ListBitbucketServerConfigsResponse) => {
        for (const config of data.bitbucketServerConfigs || []) {
          await callback(config);
        }
      },
      CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_SERVER_CONFIG.id,
      CloudBuildPermissions.FETCH_BUILD_BITBUCKET_SERVER_CONFIG,
    );
  }

  async iterateBuildBitbucketRepositories(
    serverConfig: cloudbuild_v1.Schema$BitbucketServerConfig,
    context: IntegrationStepContext,
    callback: (
      data: cloudbuild_v1.Schema$BitbucketServerRepository,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      (nextPageToken) => {
        return this.client.projects.locations.bitbucketServerConfigs.repos.list(
          {
            auth,
            pageToken: nextPageToken,
            parent: serverConfig.name!,
          },
        );
      },
      async (
        data: cloudbuild_v1.Schema$ListBitbucketServerRepositoriesResponse,
      ) => {
        for (const config of data.bitbucketServerRepositories || []) {
          await callback(config);
        }
      },
      CloudBuildStepsSpec.FETCH_BUILD_BITBUCKET_REPOS.id,
      CloudBuildPermissions.FETCH_BUILD_BITBUCKET_REPOS,
    );
  }
}
