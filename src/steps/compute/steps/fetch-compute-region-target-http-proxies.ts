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
  STEP_COMPUTE_REGION_LOADBALANCERS,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
} from '../constants';
import { createRegionTargetHttpProxyEntity } from '../converters';

export async function fetchComputeRegionTargetHttpProxies(
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

  await client.iterateRegionTargetHttpProxies(async (targetHttpProxy) => {
    const targetHttpProxyEntity =
      createRegionTargetHttpProxyEntity(targetHttpProxy);
    await jobState.addEntity(targetHttpProxyEntity);

    const loadBalancerEntity = await jobState.findEntity(
      targetHttpProxy.urlMap as string,
    );
    if (loadBalancerEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: loadBalancerEntity,
          to: targetHttpProxyEntity,
        }),
      );
    }
  });
}

export const fetchComputeRegionTargetHttpProxiesStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
    ingestionSourceId: IngestionSources.COMPUTE_REGION_TARGET_HTTP_PROXIES,
    name: 'Compute Region Target HTTP Proxies',
    entities: [
      {
        resourceName: 'Compute Region Target HTTP Proxy',
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
      },
    ],
    dependsOn: [STEP_COMPUTE_REGION_LOADBALANCERS],
    executionHandler: fetchComputeRegionTargetHttpProxies,
    permissions: ['compute.regionTargetHttpProxies.list'],
    apis: ['compute.googleapis.com'],
  };
