import { cloudidentity_v1 } from 'googleapis';
import {
  ENTITY_CLASS_CLOUD_IDENTITY_DEVICES,
  ENTITY_CLASS_CLOUD_IDENTITY_DEVICE_USERS,
  ENTITY_CLASS_CLOUD_IDENTITY_GROUPS,
  ENTITY_CLASS_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
  ENTITY_CLASS_CLOUD_IDENTITY_SSO_PROFILE,
  ENTITY_CLASS_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
  ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
  ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
  ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
  ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
} from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';

export function createCloudIdentityDeviceEntity(
  data: cloudidentity_v1.Schema$GoogleAppsCloudidentityDevicesV1Device,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_DEVICES,
        _key: data.deviceId as string,
        id: data.deviceId as string,
        displayName: data.name as string,
        name: data.name,
        deviceId: data.deviceId,
        ownerType: data.ownerType,
        model: data.model,
        hostname: data.hostname,
        compromisedState: data.compromisedState,
        managementState: data.managementState,
        encryptionState: data.encryptionState,
        buildNumber: data.buildNumber,
        make: data.manufacturer,
        networkOperator: data.networkOperator,
        wifiMacAddresses: data.wifiMacAddresses,
        imei: data.imei,
        serial: data.serialNumber,
        osVersion: data.osVersion,
        assetTag: data.assetTag,
        brand: data.brand,
        kernelVersion: data.kernelVersion,
        category: 'endpoint',
        lastSeenOn: data.lastSyncTime
          ? new Date(data.lastSyncTime).getTime()
          : null,
      },
    },
  });
}

export function createCloudIdentityDeviceUserEntity(
  data: cloudidentity_v1.Schema$GoogleAppsCloudidentityDevicesV1DeviceUser,
  deviceId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_DEVICE_USERS,
        _key: data.name as string,
        displayName: data.name as string,
        name: data.name,
        compromisedState: data.compromisedState,
        managementState: data.managementState,
        passwordState: data.passwordState,
        userEmail: data.userEmail,
        userAgent: data.userAgent,
        deviceId: deviceId,
      },
    },
  });
}

export function createCloudIdentitySSOProfileEntity(
  data: cloudidentity_v1.Schema$InboundSamlSsoProfile,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_SSO_PROFILE,
        _key: data.name as string,
        displayName: data.displayName as string,
        name: data.name,
        customer: data.customer,
        idpConfigEntityId: data.idpConfig?.entityId,
        idpConfigEntityIdSingleSignOnServiceUri:
          data.idpConfig?.singleSignOnServiceUri,
        idpConfigLogoutRedirectUri: data.idpConfig?.logoutRedirectUri,
        idpConfigChangePasswordUri: data.idpConfig?.changePasswordUri,
        spConfigEntityId: data.spConfig?.entityId,
        spConfigAssertionConsumerServiceUri:
          data.spConfig?.assertionConsumerServiceUri,
      },
    },
  });
}

export function createCloudIdentityGroupEntity(
  data: cloudidentity_v1.Schema$Group,
  ssoProfileName,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_GROUPS,
        _key: data.name as string,
        displayName: data.displayName as string,
        name: data.name?.split('/')[1],
        ssoProfileName: ssoProfileName,
      },
    },
  });
}

export function createCloudIdentityMembershipRoleEntity(
  data: cloudidentity_v1.Schema$MembershipRole,
  groupName: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
        _key: data.name as string,
        name: data.name,
        expiryTime: data.expiryDetail?.expireTime,
        groupName: groupName,
      },
    },
  });
}

export function createCloudIdentitySSOSamlProviderEntity(
  idpConfig: cloudidentity_v1.Schema$SamlIdpConfig,
  spConfig: cloudidentity_v1.Schema$SamlSpConfig,
) {
  const { entityId: idpEntityId, ...idpRest } = idpConfig;
  const { entityId: spEntityId, ...spRest } = spConfig;

  const data = {
    ...idpRest,
    ...spRest,
    samlSpConfigEntityId: spEntityId,
    idpConfigEntityId: idpEntityId,
  };

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
        _key: data.samlSpConfigEntityId as string,
        ...data,
        name: 'Saml Provider',
        category: ['security'],
        function: ['IAM']
      },
    },
  });
}
