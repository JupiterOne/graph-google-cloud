import { google, privateca_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class PrivateCaClient extends Client {
  private client = google.privateca({ version: 'v1', retry: false });

  async getAuthorityPolicy(
    caPoolId: string,
    location: string,
  ): Promise<privateca_v1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result = await this.client.projects.locations.caPools.getIamPolicy({
      resource: `projects/${this.projectId}/locations/${location}/caPools/${caPoolId}`,
      auth,
    });

    return result.data;
  }

  async iterateCaPools(
    callback: (data: privateca_v1.Schema$CaPool) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.caPools.list({
          parent: `projects/${this.projectId}/locations/-`,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: privateca_v1.Schema$ListCaPoolsResponse) => {
        for (const certificateAuthority of data.caPools || []) {
          await callback(certificateAuthority);
        }
      },
    );
  }

  async iterateCertificateAuthorities(
    caPoolId: string,
    location: string,
    callback: (data: privateca_v1.Schema$CertificateAuthority) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.caPools.certificateAuthorities.list(
          {
            parent: `projects/${this.projectId}/locations/${location}/caPools/${caPoolId}`,
            auth,
            pageToken: nextPageToken,
          },
        );
      },
      async (data: privateca_v1.Schema$ListCertificateAuthoritiesResponse) => {
        for (const certificateAuthority of data.certificateAuthorities || []) {
          await callback(certificateAuthority);
        }
      },
    );
  }

  async iterateAuthorityCertificates(
    caPoolId: string,
    caLocation: string,
    callback: (data: privateca_v1.Schema$Certificate) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.caPools.certificates.list({
          parent: `projects/${this.projectId}/locations/${caLocation}/caPools/${caPoolId}`,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: privateca_v1.Schema$ListCertificatesResponse) => {
        for (const certificate of data.certificates || []) {
          await callback(certificate);
        }
      },
    );
  }
}
