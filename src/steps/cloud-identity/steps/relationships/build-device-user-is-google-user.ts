import {
  PrimitiveEntity,
  RelationshipClass,
  RelationshipDirection,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { parseIamMember } from '../../../../utils/iam';
import { CREATE_IAM_ENTITY_MAP } from '../../../resource-manager/createIamEntities';
import {
  CloudIdentityPermissions,
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
  RELATIONSHIP_TYPE_DEVICE_USER_IS_GOOGLE_USER,
  STEP_CLOUD_IDENTITY_DEVICE_USERS,
  STEP_DEVICE_USER_IS_GOOGLE_USER,
} from '../../constants';
import { GOOGLE_USER_ENTITY_TYPE } from '../../../iam';

export async function buildDeviceUserIsGoogleUserRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS },
    async (deviceUser) => {
      const deviceUserName = deviceUser.name;

      const parsedMember = parseIamMember(`user:${deviceUserName}`);
      const sourceEntityFunction = CREATE_IAM_ENTITY_MAP[parsedMember.type];
      let targetEntity: Partial<PrimitiveEntity> | undefined = undefined;
      if (typeof sourceEntityFunction === 'function') {
        targetEntity = sourceEntityFunction(parsedMember);
      } else {
        logger.warn(
          { parsedMemberType: parsedMember.type },
          'Unable to find create entity function in CREATE_IAM_ENTITY_MAP',
        );
      }

      const relationship = targetEntity
        ? createMappedRelationship({
            _class: RelationshipClass.IS,
            _mapping: {
              relationshipDirection: RelationshipDirection.REVERSE,
              sourceEntityKey: deviceUser._key as string,
              targetFilterKeys: targetEntity._key
                ? [['_key', '_type']]
                : [['_type', 'email']],
              skipTargetCreation: false,
              targetEntity: targetEntity,
            },
            properties: {
              _type: RELATIONSHIP_TYPE_DEVICE_USER_IS_GOOGLE_USER,
            },
          })
        : undefined;
      if (relationship) {
        await jobState.addRelationship(relationship);
      }
    },
  );
}

export const buildDeviceUserIsGoogleUserRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_DEVICE_USER_IS_GOOGLE_USER,
    name: 'Build Device User Is Google User Relationship',
    entities: [],
    relationships: [
      {
        _type: RELATIONSHIP_TYPE_DEVICE_USER_IS_GOOGLE_USER,
        sourceType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
        _class: RelationshipClass.IS,
        targetType: GOOGLE_USER_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_CLOUD_IDENTITY_DEVICE_USERS],
    executionHandler: buildDeviceUserIsGoogleUserRelationship,
    permissions: CloudIdentityPermissions.DEVICE_USER_IS_GOOGLE_USER,
  };
