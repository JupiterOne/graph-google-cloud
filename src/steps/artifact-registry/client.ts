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
}
