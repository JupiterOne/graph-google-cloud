import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_PROJECT,
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_CLASS_COMPUTE_PROJECT,
  RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  STEP_COMPUTE_INSTANCES,
  ComputePermissions,
} from '../constants';
import { createComputeProjectEntity } from '../converters';
import { compute_v1 } from 'googleapis';

export async function fetchComputeProject(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  const computeProject: compute_v1.Schema$Project | undefined =
    await client.fetchComputeProject();

  if (computeProject) {
    const computeProjectEntity = createComputeProjectEntity(computeProject);
    await jobState.addEntity(computeProjectEntity);

    await jobState.iterateEntities(
      {
        _type: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
      async (computeInstanceEntity) => {
        // Add relationships to all instances but the one starting with 'gke' because GKE are handled separately
        if (!computeInstanceEntity.displayName?.startsWith('gke')) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: computeProjectEntity,
              to: computeInstanceEntity,
            }),
          );
        }
      },
    );
  }
}

export const fetchComputeProjectStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_PROJECT,
  ingestionSourceId: IngestionSources.COMPUTE_PROJECT,
  name: 'Compute Project',
  entities: [
    {
      resourceName: 'Compute Project',
      _type: ENTITY_TYPE_COMPUTE_PROJECT,
      _class: ENTITY_CLASS_COMPUTE_PROJECT,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
      sourceType: ENTITY_TYPE_COMPUTE_PROJECT,
      targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
    },
  ],
  dependsOn: [STEP_COMPUTE_INSTANCES],
  executionHandler: fetchComputeProject,
  permissions: ComputePermissions.STEP_COMPUTE_PROJECT,
  apis: ['compute.googleapis.com'],
};
