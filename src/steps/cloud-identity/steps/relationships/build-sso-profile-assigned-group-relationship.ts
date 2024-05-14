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
  ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
  RELATIONSHIP_TYPE_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP,
  STEP_CLOUD_IDENTITY_GROUPS,
  STEP_CLOUD_IDENTITY_SSO_PROFILE,
  STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP,
} from '../../constants';

export async function buildCloudIdentitySsoProfileAssignedGroupRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS },
    async (group) => {
      const ssoProfileKey = group.ssoProfileName as string;

      if (!jobState.hasKey(ssoProfileKey)) {
        throw new IntegrationMissingKeyError(`Error: Key not Found 
            Details:
            Step Id: ${STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP}
            Entity Name: SSO Profile
            SSO Profile Key: ${ssoProfileKey}`);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.ASSIGNED,
          fromKey: ssoProfileKey,
          fromType: ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
          toKey: group._key,
          toType: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
        }),
      );
    },
  );
}

export const buildCloudIdentitySsoProfileAssignedGroupRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP,
    name: 'Cloud Identity SSO Profile Assigned Group Relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.ASSIGNED,
        _type:
          RELATIONSHIP_TYPE_CLOUD_IDENTITY_SSO_PROFILE_ASSIGNED_GROUP_RELATIONSHIP,
        sourceType: ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
        targetType: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
      },
    ],
    dependsOn: [STEP_CLOUD_IDENTITY_GROUPS, STEP_CLOUD_IDENTITY_SSO_PROFILE],
    executionHandler: buildCloudIdentitySsoProfileAssignedGroupRelationship,
  };
