import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ComputePermissions,
  ENTITY_CLASS_INTERCONNECT_LOCATION,
  ENTITY_TYPE_INTERCONNECT_LOCATION,
  IngestionSources,
  STEP_INTERCONNECT_LOCATION,
} from '../constants';
import { ComputeClient } from '../client';
import { publishUnsupportedConfigEvent } from '../../../utils/events';
import { createInterconnectLocationEntity } from '../converters';

export async function fetchInterconnectLocation(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new ComputeClient({ config }, logger);

  try {
    await client.iterateInterconnectLocations(async (location) => {
      await jobState.addEntity(createInterconnectLocationEntity(location));
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Cloud Interconnect',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export const fetchInterConnectLocationStep: GoogleCloudIntegrationStep = {
  id: STEP_INTERCONNECT_LOCATION,
  ingestionSourceId: IngestionSources.INTERCONNECT_LOCATION,
  name: 'Interconnect Location',
  entities: [
    {
      resourceName: 'Interconnect Location',
      _type: ENTITY_TYPE_INTERCONNECT_LOCATION,
      _class: ENTITY_CLASS_INTERCONNECT_LOCATION,
    },
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchInterconnectLocation,
  permissions: ComputePermissions.STEP_INTERCONNECT_LOCATION,
  apis: ['compute.googleapis.com'],
};
