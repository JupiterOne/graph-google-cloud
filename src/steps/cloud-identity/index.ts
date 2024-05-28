import { GoogleCloudIntegrationStep } from '../../types';
import { fetchCloudIdentityDevicesStep } from './steps/entities/fetch-cloud-identity-devices';
import { fetchCloudIdentityDeviceUsersStep } from './steps/entities/fetch-cloud-identity-devices-users';
import { fetchCloudIdentityGroupsStep } from './steps/entities/fetch-cloud-identity-groups';
import { fetchCloudIdentityMemberShipRolesStep } from './steps/entities/fetch-cloud-identity-membership-roles';
import { fetchCloudIdentitySSOSamlProviderStep } from './steps/entities/fetch-cloud-identity-saml-provider';
import { fetchCloudIdentitySSOProfileStep } from './steps/entities/fetch-cloud-identity-sso-profile';
import { buildDeviceUserIsGoogleUserRelationshipStep } from './steps/relationships/build-device-user-is-google-user';
import { buildCloudIdentityDeviceUserUsesDeviceStep } from './steps/relationships/build-device-user-uses-device-relationship';
import { buildCloudIdentityGroupAssignedMembershipRoleStep } from './steps/relationships/build-group-assigned-membership-role';
import { buildCloudIdentitySamlProviderUsesGroupStep } from './steps/relationships/build-saml-provider-uses-groups';
import { buildCloudIdentitySsoProfileAssignedGroupRelationshipStep } from './steps/relationships/build-sso-profile-assigned-group-relationship';

export const cloudIdentitySteps: GoogleCloudIntegrationStep[] = [
  fetchCloudIdentityDevicesStep,
  fetchCloudIdentityDeviceUsersStep,
  fetchCloudIdentityGroupsStep,
  fetchCloudIdentityMemberShipRolesStep,
  fetchCloudIdentitySSOProfileStep,
  fetchCloudIdentitySSOSamlProviderStep,
  buildDeviceUserIsGoogleUserRelationshipStep,
  buildCloudIdentityDeviceUserUsesDeviceStep,
  buildCloudIdentityGroupAssignedMembershipRoleStep,
  buildCloudIdentitySsoProfileAssignedGroupRelationshipStep,
  buildCloudIdentitySamlProviderUsesGroupStep
];
