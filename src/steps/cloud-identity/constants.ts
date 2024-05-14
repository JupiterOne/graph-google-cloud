// Entity Constants
// Step Ids
export const STEP_CLOUD_IDENTITY_DEVICES = 'fetch-cloud-identity-devices';
export const STEP_CLOUD_IDENTITY_DEVICE_USERS =
  'fetch-cloud-identity-device-users';
export const STEP_CLOUD_IDENTITY_SSO_PROFILE =
  'fetch-cloud-identity-sso-profile';
export const STEP_CLOUD_IDENTITY_GROUPS = 'fetch-cloud-identity-groups';
export const STEP_CLOUD_IDENTITY_MEMBERSHIP_ROLES =
  'fetch-cloud-identity-membership-roles';
export const STEP_CLOUD_IDENTITY_SSO_SAML_PROVIDER =
  'fetch-cloud-identity-sso-saml-provider';

// Entities:  Classes and Types
export const ENTITY_TYPE_CLOUD_IDENTITY_DEVICES =
  'google_cloud_identity_device';
export const ENTITY_CLASS_CLOUD_IDENTITY_DEVICES = ['Device'];

export const ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS =
  'google_cloud_identity_user';
export const ENTITY_CLASS_CLOUD_IDENTITY_DEVICE_USERS = ['User'];

export const ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE = 'google_cloud_sso';
export const ENTITY_CLASS_CLOUD_IDENTITY_SSO_PROFILE = ['Configuration'];

export const ENTITY_TYPE_CLOUD_IDENTITY_GROUPS = 'google_cloud_identity_group';
export const ENTITY_CLASS_CLOUD_IDENTITY_GROUPS = ['UserGroup'];

export const ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES =
  'google_cloud_identity_member_role';
export const ENTITY_CLASS_CLOUD_IDENTITY_MEMBERSHIP_ROLES = ['AccessRole'];

export const ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER =
  'google_cloud_identity_saml_provider';
export const ENTITY_CLASS_CLOUD_IDENTITY_SSO_SAML_PROVIDER = ['Service'];

// Relationships Constants
// Step Ids
export const STEP_CLOUD_IDENTITY_DEVICES_USER_USES_DEVICE =
  'build-cloud-identity-device-user-uses-device-relationship';
export const STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP =
  'build-cloud-identity-sso-profile-assigned-group-relationship';
export const STEP_CLOUD_IDENTITY_GROUP_ASSIGNED_MEMBERSHIP_ROLE_RELATIONSHIP =
  'build-cloud-identity-group-assigned-membership-role-relationship';
export const STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP =
  'build-cloud-identity-device-user-assigned-group-relationship';
export const STEP_DEVICE_USER_IS_GOOGLE_USER =
  'build-cloud-identity-device-user-is-google-user';

// Relationship types
export const RELATIONSHIP_TYPE_CLOUD_IDENTITY_DEVICE_USER_USES_DEVICE =
  'google_cloud_identity_user_uses_device';
export const RELATIONSHIP_TYPE_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP =
  'google_cloud_identity_sso_assigned_group';
export const RELATIONSHIP_TYPE_GROUP_ASSIGNED_MEMBERSHIP_ROLE =
  'google_cloud_identity_group_assigned_member_role';
export const RELATIONSHIP_TYPE_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP =
  'google_cloud_identity_user_assigned_group';
export const RELATIONSHIP_TYPE_DEVICE_USER_IS_GOOGLE_USER =
  'google_cloud_identity_user_is_google_user';

export const IngestionSources = {
  CLOUD_IDENTITY_DEVICES: 'cloud-identity-devices',
  CLOUD_IDENTITY_DEVICE_USERS: 'cloud-identity-device-users',
  CLOUD_IDENTITY_SSO_PROFILE: 'cloud-identity-sso-profile',
  CLOUD_IDENTITY_GROUPS: 'cloud-identity-groups',
  CLOUD_IDENTITY_MEMBERSHIP_ROLES: 'cloud-identity-membership-roles',
  CLOUD_IDENTITY_SSO_SAML_PROVIDER: 'cloud-identity-sso-saml-provider',
};

export const CloudIdentityPermissions = {
  CLOUD_IDENTITY_DEVICES: [],
  CLOUD_IDENTITY_DEVICE_USERS: [],
  CLOUD_IDENTITY_SSO_PROFILE: [],
  CLOUD_IDENTITY_GROUPS: [],
  CLOUD_IDENTITY_MEMBERSHIP_ROLES: [],
  CLOUD_IDENTITY_DEVICE_USER_USES_DEVICE: [],
  CLOUD_IDENTITY_SSO_SAML_PROVIDER: [],
  DEVICE_USER_IS_GOOGLE_USER: [],
};
