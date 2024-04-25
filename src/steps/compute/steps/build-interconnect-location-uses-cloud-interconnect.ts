import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_CLOUD_INTERCONNECT,
  ENTITY_TYPE_INTERCONNECT_LOCATION,
  RELATIONSHIP_TYPE_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT,
  STEP_CLOUD_INTERCONNECT,
  STEP_INTERCONNECT_LOCATION,
  STEP_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT_RELATIONSHIP,
} from '../constants';

export async function buildInterconnectLocationUsesCloudInterconnectRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_CLOUD_INTERCONNECT,
    },
    async (interconnect) => {
      const interconnectLocation = interconnect.location as string;

      if (!interconnectLocation) {
        return;
      }

      const cloudInterconnectKey = interconnect._key;

      const interconnectLocationKey = await jobState.findEntity(
        interconnectLocation,
      );
      if (interconnectLocationKey) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromKey: interconnectLocationKey._key,
            fromType: ENTITY_TYPE_INTERCONNECT_LOCATION,
            toKey: cloudInterconnectKey,
            toType: ENTITY_TYPE_CLOUD_INTERCONNECT,
          }),
        );
      }
    },
  );
}

export const buildInterConnectLocationUsesCloudInterConnectStep: GoogleCloudIntegrationStep =
  {
    id: STEP_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT_RELATIONSHIP,
    name: 'Interconnect location uses cloud interconnect Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_INTERCONNECT_LOCATION_USES_CLOUD_INTERCONNECT,
        sourceType: ENTITY_TYPE_INTERCONNECT_LOCATION,
        targetType: ENTITY_TYPE_CLOUD_INTERCONNECT,
      },
    ],
    dependsOn: [STEP_INTERCONNECT_LOCATION, STEP_CLOUD_INTERCONNECT],
    executionHandler:
      buildInterconnectLocationUsesCloudInterconnectRelationships,
  };
