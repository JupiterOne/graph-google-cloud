import { artifactregistry_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { ARTIFACT_REGISTRY_LOCATIONS } from './constants';

export class artifactRegistryClient extends Client {
  private client = google.artifactregistry({ version: 'v1', retry: false });

  async iterateProjectLocations(
    callback: (locationId: string) => Promise<void>,
  ) {
    for (const location of ARTIFACT_REGISTRY_LOCATIONS) {
      await callback(location);
    }
  }

  async iterateArtifactRegistryRepository(
    callback: (data: artifactregistry_v1.Schema$Repository) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateProjectLocations(async (locationId) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.locations.repositories.list({
            auth,
            parent: `projects/${this.projectId}/locations/${locationId}`,
            pageToken: nextPageToken,
          });
        },
        async (data: artifactregistry_v1.Schema$ListRepositoriesResponse) => {
          for (const repositories of data.repositories || []) {
            await callback(repositories);
          }
        },
      );
    });
  }

  async iterateArtifactRepositoryPackage(
    repositoryName: string,
    repositoryLocation: string,
    callback: (data: artifactregistry_v1.Schema$Package) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.repositories.packages.list({
          auth,
          parent: `projects/${this.projectId}/locations/${repositoryLocation}/repositories/${repositoryName}`,
          pageToken: nextPageToken,
        });
      },
      async (data: artifactregistry_v1.Schema$ListPackagesResponse) => {
        for (const packages of data.packages || []) {
          await callback(packages);
        }
      },
    );
  }

  async iterateArtifactRegistryVpcscConfig(
    callback: (data: artifactregistry_v1.Schema$VPCSCConfig) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    console.log('check 1');
    //await this.iterateProjectLocations(async (locationId) => {
    await this.iterateApi(
      async () => {
        console.log('inside');
        return this.client.projects.locations.getVpcscConfig({
          name: `projects/${this.projectId}/locations/northamerica-northeast1/vpcscConfig`,
          auth,
        });
      },
      async (data: artifactregistry_v1.Schema$VPCSCConfig) => {
        console.log(data.name);
        await callback(data);
      },
    );
    //})
  }
}
