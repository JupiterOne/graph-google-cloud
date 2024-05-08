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
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  STEP_COMPUTE_LOADBALANCERS,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_BUCKET,
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_BACKEND_BUCKETS,
  ComputePermissions,
} from '../constants';
import { createLoadBalancerEntity } from '../converters';
import { compute_v1 } from 'googleapis';

function getBackendServices(
  pathMatchers: compute_v1.Schema$PathMatcher[],
  type: 'backendServices' | 'backendBuckets',
) {
  const services: string[] = [];

  for (const pathMatcher of pathMatchers) {
    if (
      pathMatcher.defaultService?.includes(type) &&
      !services.find((backend) => backend == pathMatcher.defaultService)
    ) {
      services.push(pathMatcher.defaultService);
    }

    // Sub-urls can have different services assigned to them
    for (const pathRule of pathMatcher.pathRules || []) {
      if (
        pathRule.service?.includes(type) &&
        !services.find((backend) => backend == pathRule.service)
      ) {
        services.push(pathRule.service);
      }
    }
  }

  return services;
}

export async function fetchComputeLoadBalancers(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateLoadBalancers(async (loadBalancer) => {
    const loadBalancerEntity = createLoadBalancerEntity(loadBalancer);
    await jobState.addEntity(loadBalancerEntity);

    const backendServicesIds = getBackendServices(
      loadBalancer.pathMatchers || [],
      'backendServices',
    );
    const backendBucketsIds = getBackendServices(
      loadBalancer.pathMatchers || [],
      'backendBuckets',
    );

    // loadbalancer -> HAS -> backendService relationships
    for (const backendServiceKey of backendServicesIds) {
      const backendService = await jobState.findEntity(backendServiceKey);
      if (backendService) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: loadBalancerEntity,
            to: backendService,
          }),
        );
      }
    }

    // loadbalancer -> HAS -> backendBucket relationships
    for (const backendBucketKey of backendBucketsIds) {
      const backendBucket = await jobState.findEntity(backendBucketKey);
      if (backendBucket) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: loadBalancerEntity,
            to: backendBucket,
          }),
        );
      }
    }
  });
}

export const fetchComputeLoadbalancersStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_LOADBALANCERS,
  ingestionSourceId: IngestionSources.COMPUTE_LOADBALANCERS,
  name: 'Compute Load Balancers',
  entities: [
    {
      resourceName: 'Compute Load Balancer',
      _type: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
      _class: ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
      sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
      targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
    },
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_BUCKET,
      sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
      targetType: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
    },
  ],
  dependsOn: [STEP_COMPUTE_BACKEND_SERVICES, STEP_COMPUTE_BACKEND_BUCKETS],
  executionHandler: fetchComputeLoadBalancers,
  permissions: ComputePermissions.STEP_COMPUTE_LOADBALANCERS,
  apis: ['compute.googleapis.com'],
};
