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
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
  ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
} from '../constants';
import { createRegionBackendServiceEntity } from '../converters';

export async function fetchComputeRegionBackendServices(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
      onRetry(err) {
        context.logger.info({ err }, 'Retrying API call');
      },
    },
    logger,
  );

  await client.iterateRegionBackendServices(async (regionBackendService) => {
    const regionBackendServiceEntity =
      createRegionBackendServiceEntity(regionBackendService);
    await jobState.addEntity(regionBackendServiceEntity);

    // Get all the instanceGroupKeys
    for (const backend of regionBackendService.backends || []) {
      if (backend.group?.includes('instanceGroups')) {
        const instanceGroupEntity = await jobState.findEntity(backend.group);
        if (instanceGroupEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: regionBackendServiceEntity,
              to: instanceGroupEntity,
            }),
          );
        }
      }
    }

    // Add relationships to health checks
    for (const healthCheckKey of regionBackendService.healthChecks || []) {
      const healthCheckEntity = await jobState.findEntity(healthCheckKey);
      if (healthCheckEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: regionBackendServiceEntity,
            to: healthCheckEntity,
          }),
        );
      }
    }
  });
}

export const fetchComputeRegionBackendServicesStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_REGION_BACKEND_SERVICES,
    ingestionSourceId: IngestionSources.COMPUTE_REGION_BACKEND_SERVICES,
    name: 'Compute Region Backend Services',
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
    dependsOn: [
      STEP_COMPUTE_REGION_INSTANCE_GROUPS,
      STEP_COMPUTE_REGION_HEALTH_CHECKS,
    ],
    executionHandler: fetchComputeRegionBackendServices,
    permissions: ['compute.regionBackendServices.list'],
    apis: ['compute.googleapis.com'],
  };
