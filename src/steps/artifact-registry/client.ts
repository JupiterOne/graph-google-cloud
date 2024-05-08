import { artifactregistry_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  ARTIFACT_REGISTRY_LOCATIONS,
  STEP_ARTIFACT_REGISTRY_REPOSITORY,
  STEP_ARTIFACT_REGISTRY_VPCSC_CONFIGURATION,
  STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
  artifactRegistryPermissions,
} from './constants';

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
        STEP_ARTIFACT_REGISTRY_REPOSITORY,
        artifactRegistryPermissions.STEP_ARTIFACT_REGISTRY_REPOSITORY,
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
      STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
      artifactRegistryPermissions.STEP_ARTIFACT_REPOSIOTRY_PACKAGE,
    );
  }

  async iterateArtifactRegistryVpcscConfig(
    callback: (data: artifactregistry_v1.Schema$VPCSCConfig) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateProjectLocations(async (locationId) => {
      await this.iterateApi(
        async () => {
          return this.client.projects.locations.getVpcscConfig({
            name: `projects/${this.projectId}/locations/${locationId}/vpcscConfig`,
            auth,
          });
        },
        async (data: artifactregistry_v1.Schema$VPCSCConfig) => {
          await callback(data);
        },
        STEP_ARTIFACT_REGISTRY_VPCSC_CONFIGURATION,
        artifactRegistryPermissions.STEP_ARTIFACT_REGISTRY_VPCSC_CONFIGURATION,
      );
    });
  }
}
