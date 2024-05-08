import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ComputePermissions,
  ENTITY_CLASS_CLOUD_INTERCONNECT,
  ENTITY_TYPE_CLOUD_INTERCONNECT,
  IngestionSources,
  STEP_CLOUD_INTERCONNECT,
} from '../constants';
import { ComputeClient } from '../client';
import { publishUnsupportedConfigEvent } from '../../../utils/events';
import { createCloudInterconnectEntity } from '../converters';

export async function fetchCloudInterconnect(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new ComputeClient({ config }, logger);

  try {
    await client.iterateCloudInterconnect(async (interconnect) => {
      await jobState.addEntity(createCloudInterconnectEntity(interconnect));
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

export const fetchCloudInterConnectStep: GoogleCloudIntegrationStep = {
  id: STEP_CLOUD_INTERCONNECT,
  ingestionSourceId: IngestionSources.CLOUD_INTERCONNECT,
  name: 'Cloud Interconnect',
  entities: [
    {
      resourceName: 'Cloud Interconnect',
      _type: ENTITY_TYPE_CLOUD_INTERCONNECT,
      _class: ENTITY_CLASS_CLOUD_INTERCONNECT,
      schema: {
        properties: {
          CIDR: { exclude: true },
          internal: { exclude: true },
          id: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'string' },
          interConnectType: { type: 'string' },
          kind: { type: 'string' },
          public: { type: 'boolean' },
          adminEnabled: { type: 'boolean' },
          createdOn: { type: 'number' },
        },
      },
    },
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchCloudInterconnect,
  permissions: ComputePermissions.STEP_CLOUD_INTERCONNECT,
  apis: ['compute.googleapis.com'],
};
