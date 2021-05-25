import { google, privateca_v1beta1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

export class PrivateCaClient extends Client {
  private client = google.privateca('v1beta1');

  async getAuthorityPolicy(
    authorityId: string,
    location: string,
  ): Promise<privateca_v1beta1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result =
      await this.client.projects.locations.certificateAuthorities.getIamPolicy({
        resource: `projects/${this.projectId}/locations/${location}/certificateAuthorities/${authorityId}`,
        auth,
      });

    return result.data;
  }

  async iterateCertificateAuthorities(
    callback: (
      data: privateca_v1beta1.Schema$CertificateAuthority,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.certificateAuthorities.list({
          parent: `projects/${this.projectId}/locations/-`,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (
        data: privateca_v1beta1.Schema$ListCertificateAuthoritiesResponse,
      ) => {
        for (const certificateAuthority of data.certificateAuthorities || []) {
          await callback(certificateAuthority);
        }
      },
    );
  }

  async iterateAuthorityCertificates(
    caId: string,
    caLocation: string,
    callback: (data: privateca_v1beta1.Schema$Certificate) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.certificateAuthorities.certificates.list(
          {
            parent: `projects/${this.projectId}/locations/${caLocation}/certificateAuthorities/${caId}`,
            auth,
            pageToken: nextPageToken,
          },
        );
      },
      async (data: privateca_v1beta1.Schema$ListCertificatesResponse) => {
        for (const certificate of data.certificates || []) {
          await callback(certificate);
        }
      },
    );
  }
}
