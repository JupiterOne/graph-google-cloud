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
  STEP_COMPUTE_REGION_LOADBALANCERS,
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
} from '../constants';
import { createRegionLoadBalancerEntity } from '../converters';
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

export async function fetchComputeRegionLoadBalancers(
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

  await client.iterateRegionLoadBalancers(async (loadBalancer) => {
    const loadBalancerEntity = createRegionLoadBalancerEntity(loadBalancer);
    await jobState.addEntity(loadBalancerEntity);

    const backendServicesIds = getBackendServices(
      loadBalancer.pathMatchers || [],
      'backendServices',
    );

    // regionLoadbalancer -> HAS -> regionBackendService relationship
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

    // region backend buckets don't exists
    // To be researched: can region loadbalancer have backend buckets (non-region ones)?
    // Add regionLoadbalancer -> HAS -> backendBucket relationships
  });
}

export const fetchComputeRegionLoadbalancersStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_REGION_LOADBALANCERS,
    ingestionSourceId: IngestionSources.COMPUTE_REGION_LOADBALANCERS,
    name: 'Compute Region Load Balancers',
    entities: [
      {
        resourceName: 'Compute Region Load Balancer',
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
    ],
    dependsOn: [STEP_COMPUTE_REGION_BACKEND_SERVICES],
    executionHandler: fetchComputeRegionLoadBalancers,
    permissions: ['compute.regionUrlMaps.list'],
    apis: ['compute.googleapis.com'],
  };
