import { cloudidentity_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  CloudIdentityPermissions,
  STEP_CLOUD_IDENTITY_DEVICES,
  STEP_CLOUD_IDENTITY_DEVICE_USERS,
  STEP_CLOUD_IDENTITY_GROUPS,
  STEP_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
  STEP_CLOUD_IDENTITY_SAML_PROVIDER_USES_GROUP,
  STEP_CLOUD_IDENTITY_SSO_PROFILE,
} from './constants';

export class CloudIdentityClient extends Client {
  private client = google.cloudidentity({ version: 'v1', retry: false });

  async iterateCloudIdentityDevices(
    callback: (
      data: cloudidentity_v1.Schema$GoogleAppsCloudidentityDevicesV1Device,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        const request = await this.client.devices.list({
          auth,
          pageToken: nextPageToken,
        });
        return request;
      },
      async (
        data: cloudidentity_v1.Schema$GoogleAppsCloudidentityDevicesV1ListDevicesResponse,
      ) => {
        for (const item of data.devices || []) {
          await callback(item);
        }
      },
      STEP_CLOUD_IDENTITY_DEVICES,
      CloudIdentityPermissions.CLOUD_IDENTITY_DEVICES,
    );
  }

  async iterateCloudIdentityDeviceUsers(
    deviceName: string,
    callback: (
      data: cloudidentity_v1.Schema$GoogleAppsCloudidentityDevicesV1DeviceUser,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        const response = await this.client.devices.deviceUsers.list({
          auth,
          pageToken: nextPageToken,
          parent: `devices/${deviceName}`,
        });
        return response;
      },
      async (
        data: cloudidentity_v1.Schema$GoogleAppsCloudidentityDevicesV1ListDeviceUsersResponse,
      ) => {
        for (const item of data.deviceUsers || []) {
          await callback(item);
        }
      },
      STEP_CLOUD_IDENTITY_DEVICE_USERS,
      CloudIdentityPermissions.CLOUD_IDENTITY_DEVICE_USERS,
    );
  }

  async iterateCloudIdentityGroups(
    customer,
    callback: (data: cloudidentity_v1.Schema$Group) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.groups.list({
          auth,
          pageToken: nextPageToken,
          parent: `customers/${customer}`,
        });
      },
      async (data: cloudidentity_v1.Schema$ListGroupsResponse) => {
        for (const item of data.groups || []) {
          await callback(item);
        }
      },
      STEP_CLOUD_IDENTITY_GROUPS,
      CloudIdentityPermissions.CLOUD_IDENTITY_GROUPS,
    );
  }

  async iterateCloudIdentitySsoProfile(
    callback: (
      data: cloudidentity_v1.Schema$InboundSamlSsoProfile,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        const res = await this.client.inboundSamlSsoProfiles.list({
          auth,
          pageToken: nextPageToken,
        });
        return res;
      },
      async (
        data: cloudidentity_v1.Schema$ListInboundSamlSsoProfilesResponse,
      ) => {
        for (const item of data.inboundSamlSsoProfiles || []) {
          await callback(item);
        }
      },
      STEP_CLOUD_IDENTITY_SSO_PROFILE,
      CloudIdentityPermissions.CLOUD_IDENTITY_SSO_PROFILE,
    );
  }

  async iterateCloudIdentityGroupMembershipRole(
    group,
    callback: (
      data: cloudidentity_v1.Schema$MembershipRole,
      membershipRoleName: string,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.groups.memberships.list({
          auth,
          pageToken: nextPageToken,
          parent: `groups/${group}`,
        });
      },
      async (data: cloudidentity_v1.Schema$ListMembershipsResponse) => {
        for (const item of data.memberships || []) {
          for (const role of item.roles || []) {
            await callback(role, item.name as string);
          }
        }
      },
      STEP_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
      CloudIdentityPermissions.CLOUD_IDENTITY_MEMBERSHIP_ROLES,
    );
  }

  async iterateCloudIdentitySsoAssignment(
    callback: (
      data: cloudidentity_v1.Schema$InboundSsoAssignment,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.inboundSsoAssignments.list({
          auth,
          pageToken: nextPageToken,
        });
      },
      async (
        data: cloudidentity_v1.Schema$ListInboundSsoAssignmentsResponse,
      ) => {
        for (const item of data.inboundSsoAssignments || []) {
          await callback(item);
        }
      },
      STEP_CLOUD_IDENTITY_SAML_PROVIDER_USES_GROUP,
      [],
    );
  }
}
