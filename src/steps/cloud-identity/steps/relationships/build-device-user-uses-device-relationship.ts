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
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
  RELATIONSHIP_TYPE_CLOUD_IDENTITY_DEVICE_USER_USES_DEVICE,
  STEP_CLOUD_IDENTITY_DEVICES,
  STEP_CLOUD_IDENTITY_DEVICES_USER_USES_DEVICE,
  STEP_CLOUD_IDENTITY_DEVICE_USERS,
} from '../../constants';

export async function buildCloudIdentityDeviceUserUsesDeviceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS },
    async (deviceUser) => {
      const deviceEntityKey = deviceUser.deviceId as string;

      if (!jobState.hasKey(deviceEntityKey)) {
        throw new IntegrationMissingKeyError(`Error: Key not Found 
            Details:
            Step Id: ${STEP_CLOUD_IDENTITY_DEVICES_USER_USES_DEVICE}
            Entity Name: Device
            Device Key: ${deviceEntityKey}`);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: deviceUser._key,
          fromType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
          toKey: deviceEntityKey,
          toType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
        }),
      );
    },
  );
}

export const buildCloudIdentityDeviceUserUsesDeviceStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_IDENTITY_DEVICES_USER_USES_DEVICE,
    name: 'Cloud Identity Devices User Uses Device',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_CLOUD_IDENTITY_DEVICE_USER_USES_DEVICE,
        sourceType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
        targetType: ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
      },
    ],
    dependsOn: [STEP_CLOUD_IDENTITY_DEVICES, STEP_CLOUD_IDENTITY_DEVICE_USERS],
    executionHandler: buildCloudIdentityDeviceUserUsesDeviceRelationship,
  };
