import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import {
  ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
  ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
  RELATIONSHIP_TYPE_GROUP_ASSIGNED_MEMBERSHIP_ROLE,
  STEP_CLOUD_IDENTITY_GROUPS,
  STEP_CLOUD_IDENTITY_GROUP_ASSIGNED_MEMBERSHIP_ROLE_RELATIONSHIP,
  STEP_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
} from '../../constants';

export async function buildCloudIdentityGroupAssignedMembershipRoleRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES },
    async (membershipRole) => {
      const groupEntityKey = membershipRole.groupName as string;

      if (!jobState.hasKey(groupEntityKey)) {
        throw new IntegrationMissingKeyError(`Error: Key not Found 
              Details:
              Step Id: ${STEP_CLOUD_IDENTITY_GROUP_ASSIGNED_MEMBERSHIP_ROLE_RELATIONSHIP}
              Entity Name: Group
              Group Key: ${groupEntityKey}`);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.ASSIGNED,
          fromKey: groupEntityKey,
          fromType: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
          toKey: membershipRole._key,
          toType: ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
        }),
      );
    },
  );
}

export const buildCloudIdentityGroupAssignedMembershipRoleStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_IDENTITY_GROUP_ASSIGNED_MEMBERSHIP_ROLE_RELATIONSHIP,
    name: 'Cloud Identity Group Assigned Membership Role Relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.ASSIGNED,
        _type: RELATIONSHIP_TYPE_GROUP_ASSIGNED_MEMBERSHIP_ROLE,
        sourceType: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
        targetType: ENTITY_TYPE_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
      },
    ],
    dependsOn: [
      STEP_CLOUD_IDENTITY_MEMBERSHIP_ROLES,
      STEP_CLOUD_IDENTITY_GROUPS,
    ],
    executionHandler: buildCloudIdentityGroupAssignedMembershipRoleRelationship,
  };
