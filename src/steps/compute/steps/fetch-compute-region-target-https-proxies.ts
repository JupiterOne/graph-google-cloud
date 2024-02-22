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
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_REGION_LOADBALANCERS,
} from '../constants';
import { createRegionTargetHttpsProxyEntity } from '../converters';

export async function fetchComputeRegionTargetHttpsProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateRegionTargetHttpsProxies(async (targetHttpsProxy) => {
    const targetHttpsProxyEntity =
      createRegionTargetHttpsProxyEntity(targetHttpsProxy);
    await jobState.addEntity(targetHttpsProxyEntity);

    const loadBalancerEntity = await jobState.findEntity(
      targetHttpsProxy.urlMap as string,
    );
    if (loadBalancerEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: loadBalancerEntity,
          to: targetHttpsProxyEntity,
        }),
      );
    }
  });
}

export const fetchComputeRegionTargetHttpsProxiesStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
    ingestionSourceId: IngestionSources.COMPUTE_REGION_TARGET_HTTPS_PROXIES,
    name: 'Compute Region Target HTTPS Proxies',
    entities: [
      {
        resourceName: 'Compute Region Target HTTPS Proxy',
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    dependsOn: [STEP_COMPUTE_REGION_LOADBALANCERS],
    executionHandler: fetchComputeRegionTargetHttpsProxies,
    permissions: ['compute.regionTargetHttpsProxies.list'],
    apis: ['compute.googleapis.com'],
  };
