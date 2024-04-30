import { google, dns_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  DNSPermissions,
  STEP_DNS_MANAGED_ZONES,
  STEP_DNS_POLICIES,
} from './constants';

export class DNSClient extends Client {
  private client = google.dns({ version: 'v1', retry: false });

  async iterateDNSManagedZones(
    callback: (data: dns_v1.Schema$ManagedZone) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.managedZones.list({
          project: this.projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: dns_v1.Schema$ManagedZonesListResponse) => {
        for (const managedZone of data.managedZones || []) {
          await callback(managedZone);
        }
      },
      STEP_DNS_MANAGED_ZONES,
      DNSPermissions.STEP_DNS_MANAGED_ZONES,
    );
  }

  async iterateDNSPolicies(
    callback: (data: dns_v1.Schema$Policy) => Promise<void>,
  ) {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.policies.list({
          project: this.projectId,
          auth,
          pageToken: nextPageToken,
        });
      },
      async (data: dns_v1.Schema$PoliciesListResponse) => {
        for (const policy of data.policies || []) {
          await callback(policy);
        }
      },
      STEP_DNS_POLICIES,
      DNSPermissions.STEP_DNS_POLICIES,
    );
  }
}
