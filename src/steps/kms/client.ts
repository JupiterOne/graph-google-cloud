import { google, cloudkms_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { KMS_SERVICE_LOCATIONS } from './constants';

export class CloudKmsClient extends Client {
  private client = google.cloudkms({ version: 'v1', retry: false });

  async iterateProjectLocations(
    callback: (locationId: string) => Promise<void>,
  ) {
    for (const location of KMS_SERVICE_LOCATIONS) {
      await callback(location);
    }
  }

  async iterateKeyRings(
    callback: (data: cloudkms_v1.Schema$KeyRing) => Promise<void>,
    onComplete?: (data: {
      totalRequestsMade: number;
      totalResourcesReturned: number;
      maximumResourcesPerPage: number;
    }) => void,
  ) {
    const auth = await this.getAuthenticatedServiceClient();
    let totalRequestsMade = 0;
    let totalResourcesReturned = 0;
    let maximumResourcesPerPage = 0;

    try {
      await this.iterateProjectLocations(async (locationId) => {
        await this.iterateApi(
          async (nextPageToken) => {
            return this.client.projects.locations.keyRings.list({
              auth,
              pageToken: nextPageToken,
              pageSize: 200,
              parent: `projects/${this.projectId}/locations/${locationId}`,
            });
          },
          async (data: cloudkms_v1.Schema$ListKeyRingsResponse) => {
            totalRequestsMade++;
            if (data.keyRings) {
              totalResourcesReturned += data.keyRings.length;
              if (data.keyRings.length > maximumResourcesPerPage) {
                maximumResourcesPerPage = data.keyRings.length;
              }
            }
            for (const item of data.keyRings || []) {
              await callback(item);
            }
          },
        );
      });
    } finally {
      if (onComplete) {
        onComplete({
          totalRequestsMade,
          totalResourcesReturned,
          maximumResourcesPerPage,
        });
      }
    }
  }

  async iterateCryptoKeys(
    {
      cryptoKeyRingShortName,
      location,
    }: {
      cryptoKeyRingShortName: string;
      location: string;
    },
    callback: (data: cloudkms_v1.Schema$CryptoKey) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.keyRings.cryptoKeys.list({
          auth,
          pageToken: nextPageToken,
          parent: `projects/${this.projectId}/locations/${location}/keyRings/${cryptoKeyRingShortName}`,
        });
      },
      async (data: cloudkms_v1.Schema$ListCryptoKeysResponse) => {
        for (const item of data.cryptoKeys || []) {
          await callback(item);
        }
      },
    );
  }

  async fetchCryptoKeyPolicy(resource: string) {
    const auth = await this.getAuthenticatedServiceClient();

    const result =
      await this.client.projects.locations.keyRings.cryptoKeys.getIamPolicy({
        auth,
        resource,
      });

    return result.data;
  }
}
