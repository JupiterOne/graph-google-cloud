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
  ENTITY_TYPE_COMPUTE_PROJECT,
  REATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT,
  STEP_CLOUD_INTERCONNECT,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
} from '../constants';

export async function buildComputeProjectHasCloudInterconnectRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_CLOUD_INTERCONNECT,
    },
    async (cloudInterconnect) => {
      const projectId = cloudInterconnect.projectId as string;
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
            toKey: cloudInterconnect._key,
            toType: ENTITY_TYPE_CLOUD_INTERCONNECT,
          }),
        );
      }
    },
  );
}

export const buildComputeProjectHasCloudInterconnectStep: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT_RELATIONSHIP,
    name: 'Compute Project Has Cloud Interconnect Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: REATIONSHIP_TYPE_COMPUTE_PROJECT_HAS_CLOUD_INTERCONNECT,
        sourceType: ENTITY_TYPE_COMPUTE_PROJECT,
        targetType: ENTITY_TYPE_CLOUD_INTERCONNECT,
      },
    ],
    dependsOn: [STEP_COMPUTE_PROJECT, STEP_CLOUD_INTERCONNECT],
    executionHandler: buildComputeProjectHasCloudInterconnectRelationship,
  };
