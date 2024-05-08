import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_TYPE_INTERCONNECT_LOCATION,
  RELATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP,
  STEP_INTERCONNECT_LOCATION,
} from '../constants';

export async function buildComputeProjectHasInterconnectLocationRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_INTERCONNECT_LOCATION,
    },
    async (location) => {
      const projectId = location.projectId as string;
      if (!projectId) {
        return;
      }
      const projectKey =
        'https://www.googleapis.com/compute/v1/projects/' + projectId;
      if (projectKey) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: projectKey,
            fromType: ENTITY_TYPE_COMPUTE_PROJECT,
            toKey: location._key,
            toType: ENTITY_TYPE_INTERCONNECT_LOCATION,
          }),
        );
      }
    },
  );
}

export const buildComputeProjectHasInterconnectLocationStep: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION_RELATIONSHIP,
    name: 'Compute Project Has Interconnect Location Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_INTERCONNECT_LOCATION,
        sourceType: ENTITY_TYPE_COMPUTE_PROJECT,
        targetType: ENTITY_TYPE_INTERCONNECT_LOCATION,
      },
    ],
    dependsOn: [STEP_COMPUTE_PROJECT, STEP_INTERCONNECT_LOCATION],
    executionHandler: buildComputeProjectHasInterconnectLocationRelationship,
  };
