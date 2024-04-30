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
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
  ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_INSTANCE_GROUPS,
  STEP_COMPUTE_HEALTH_CHECKS,
  ComputePermissions,
} from '../constants';
import { createBackendServiceEntity } from '../converters';

export async function fetchComputeBackendServices(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateBackendServices(async (backendService) => {
    const backendServiceEntity = createBackendServiceEntity(backendService);
    await jobState.addEntity(backendServiceEntity);

    // Get all the instanceGroupKeys
    for (const backend of backendService.backends || []) {
      if (backend.group?.includes('instanceGroups')) {
        const instanceGroupEntity = await jobState.findEntity(backend.group);
        if (instanceGroupEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: backendServiceEntity,
              to: instanceGroupEntity,
            }),
          );
        }
      }
    }

    // Add relationships to health checks
    for (const healthCheckKey of backendService.healthChecks || []) {
      const healthCheckEntity = await jobState.findEntity(healthCheckKey);
      if (healthCheckEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: backendServiceEntity,
            to: healthCheckEntity,
          }),
        );
      }
    }
  });
}

export const fetchComputeBackendServicesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_BACKEND_SERVICES,
  ingestionSourceId: IngestionSources.COMPUTE_BACKEND_SERVICES,
  name: 'Compute Backend Services',
  entities: [
    {
      resourceName: 'Compute Backend Service',
      _type: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      _class: ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
      sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      targetType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
    },
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
      sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      targetType: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
    },
  ],
  dependsOn: [STEP_COMPUTE_INSTANCE_GROUPS, STEP_COMPUTE_HEALTH_CHECKS],
  executionHandler: fetchComputeBackendServices,
  permissions: ComputePermissions.STEP_COMPUTE_BACKEND_SERVICES,
  apis: ['compute.googleapis.com'],
};
