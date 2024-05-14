import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { CloudIdentityClient } from '../../client';
import {
  CloudIdentityPermissions,
  ENTITY_CLASS_CLOUD_IDENTITY_DEVICES,
  ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
  IngestionSources,
  STEP_CLOUD_IDENTITY_DEVICES,
} from '../../constants';
import { createCloudIdentityDeviceEntity } from '../../converter';

export async function fetchCloudIdentityDevices(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new CloudIdentityClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateCloudIdentityDevices(async (device) => {
    const deviceEntity = createCloudIdentityDeviceEntity(device);
    await jobState.addEntity(deviceEntity);
  });
}

export const fetchCloudIdentityDevicesStep: GoogleCloudIntegrationStep = {
  id: STEP_CLOUD_IDENTITY_DEVICES,
  ingestionSourceId: IngestionSources.CLOUD_IDENTITY_DEVICES,
  name: 'Cloud Identity Devices',
  entities: [
    {
      resourceName: 'Cloud Identity Devices',
      _type: ENTITY_TYPE_CLOUD_IDENTITY_DEVICES,
      _class: ENTITY_CLASS_CLOUD_IDENTITY_DEVICES,
    },
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchCloudIdentityDevices,
  permissions: CloudIdentityPermissions.CLOUD_IDENTITY_DEVICES,
  apis: ['cloudidentity.googleapis.com'],
};
