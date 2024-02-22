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
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  STEP_COMPUTE_LOADBALANCERS,
} from '../constants';
import { createTargetHttpsProxyEntity } from '../converters';

export async function fetchComputeTargetHttpsProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateTargetHttpsProxies(async (targetHttpsProxy) => {
    const targetHttpsProxyEntity =
      createTargetHttpsProxyEntity(targetHttpsProxy);
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

export const fetchComputeTargetHttpsProxiesStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_TARGET_HTTPS_PROXIES,
    ingestionSourceId: IngestionSources.COMPUTE_TARGET_HTTPS_PROXIES,
    name: 'Compute Target HTTPS Proxies',
    entities: [
      {
        resourceName: 'Compute Target HTTPS Proxy',
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
    dependsOn: [STEP_COMPUTE_LOADBALANCERS],
    executionHandler: fetchComputeTargetHttpsProxies,
    permissions: ['compute.targetHttpsProxies.list'],
    apis: ['compute.googleapis.com'],
  };
