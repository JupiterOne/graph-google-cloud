import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { CloudIdentityClient } from '../../client';
import {
  CloudIdentityPermissions,
  ENTITY_CLASS_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
  ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
  ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
  IngestionSources,
  STEP_CLOUD_IDENTITY_GROUPS,
  STEP_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
} from '../../constants';
import { createCloudIdentityMembershipRoleEntity } from '../../converter';

export async function fetchCloudIdentityMembershipRoles(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new CloudIdentityClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS },
    async (group) => {
      const groupName = group.name as string;

      await client.iterateCloudIdentityGroupMembershipRole(
        groupName,
        async (membershipRole, membershipRoleName) => {
          if (jobState.hasKey(membershipRole.name as string)) {
            return;
          }
          const membershipRoleEntity = createCloudIdentityMembershipRoleEntity(
            membershipRole,
            membershipRoleName,
            groupName,
          );
          await jobState.addEntity(membershipRoleEntity);
        },
      );
    },
  );
}

export const fetchCloudIdentityMemberShipRolesStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
    ingestionSourceId: IngestionSources.CLOUD_IDENTITY_MEMBERSHIP_ROLES,
    name: 'Cloud Identity Membership Roles',
    entities: [
      {
        resourceName: 'Cloud Identity Membership Roles',
        _type: ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
      },
    ],
    relationships: [],
    dependsOn: [STEP_CLOUD_IDENTITY_GROUPS],
    executionHandler: fetchCloudIdentityMembershipRoles,
    permissions: CloudIdentityPermissions.CLOUD_IDENTITY_MEMBERSHIP_ROLES,
    apis: ['cloudidentity.googleapis.com'],
  };
