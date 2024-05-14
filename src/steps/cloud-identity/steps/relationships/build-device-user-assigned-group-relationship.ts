// TODO: Implement the relationship logic code when we get data from GCP.

import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import {
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
  ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
  RELATIONSHIP_TYPE_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP,
  STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP,
  STEP_CLOUD_IDENTITY_DEVICE_USERS,
  STEP_CLOUD_IDENTITY_GROUPS,
} from '../../constants';

export async function buildCloudIdentityDeviceUserAssignedGroupRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  // TODO: Write Relationship Logic.
  //   const { jobState } = context;
  //   await jobState.iterateEntities(
  //     { _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS },
  //     async (deviceUser) => {
  //       const deviceEntityKey = deviceUser.deviceId as string;
  //       if (!jobState.hasKey(deviceEntityKey)) {
  //         throw new IntegrationMissingKeyError(`Error: Key not Found
  //               Details:
  //               Step Id: ${}
  //               Entity Name:
  //               Device Key: ${}`);
  //       }
  //       await jobState.addRelationship(
  //         createDirectRelationship({
  //           _class: RelationshipClass.ASSIGNED,
  //           fromKey: deviceUser._key,
  //           fromType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
  //           toKey: deviceEntityKey,
  //           toType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
  //         }),
  //       );
  //     },
  //   );
}

export const buildCloudIdentityDeviceUserAssignedGroupStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP,
    name: 'Cloud Identity Devices User Assigned GroupA',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.ASSIGNED,
        _type: RELATIONSHIP_TYPE_CLOUD_IDENTITY_DEVICES_USER_ASSIGNED_GROUP,
        sourceType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
        targetType: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
      },
    ],
    dependsOn: [STEP_CLOUD_IDENTITY_GROUPS, STEP_CLOUD_IDENTITY_DEVICE_USERS],
    executionHandler: buildCloudIdentityDeviceUserAssignedGroupRelationship,
  };
