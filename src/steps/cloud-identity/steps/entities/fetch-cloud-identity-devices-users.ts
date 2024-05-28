import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { CloudIdentityClient } from '../../client';
import {
  CloudIdentityPermissions,
  ENTITY_CLASS_CLOUD_IDENTITY_DEVICE_USERS,
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
  IngestionSources,
  STEP_CLOUD_IDENTITY_DEVICES,
  STEP_CLOUD_IDENTITY_DEVICE_USERS,
} from '../../constants';
import { createCloudIdentityDeviceUserEntity } from '../../converter';

export async function fetchCloudIdentityDeviceUsers(
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
    { _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICES },
    async (device) => {
      const deviceName = device.name as string;
      const deviceId = device.id as string;
      await client.iterateCloudIdentityDeviceUsers(
        deviceName,
        async (deviceUser) => {
          if(jobState.hasKey(deviceUser.name as string)){
            return;
          }
          const deviceUserEntity = createCloudIdentityDeviceUserEntity(
            deviceUser,
            deviceId,
          );
          await jobState.addEntity(deviceUserEntity);
        },
      );
    },
  );
}

export const fetchCloudIdentityDeviceUsersStep: GoogleCloudIntegrationStep = {
  id: STEP_CLOUD_IDENTITY_DEVICE_USERS,
  ingestionSourceId: IngestionSources.CLOUD_IDENTITY_DEVICE_USERS,
  name: 'Cloud Identity Device Users',
  entities: [
    {
      resourceName: 'Cloud Identity Device Users',
      _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICE_USERS,
      _class: ENTITY_CLASS_CLOUD_IDENTITY_DEVICE_USERS,
    },
  ],
  relationships: [],
  dependsOn: [STEP_CLOUD_IDENTITY_DEVICES],
  executionHandler: fetchCloudIdentityDeviceUsers,
  permissions: CloudIdentityPermissions.CLOUD_IDENTITY_DEVICE_USERS,
  apis: ['cloudidentity.googleapis.com'],
};
