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
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_LOADBALANCERS,
} from '../constants';
import { createTargetHttpProxyEntity } from '../converters';

export async function fetchComputeTargetHttpProxies(
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

  await client.iterateTargetHttpProxies(async (targetHttpProxy) => {
    const targetHttpProxyEntity = createTargetHttpProxyEntity(targetHttpProxy);
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

export const fetchComputeTargetHttpProxiesStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_TARGET_HTTP_PROXIES,
    ingestionSourceId: IngestionSources.COMPUTE_TARGET_HTTP_PROXIES,
    name: 'Compute Target HTTP Proxies',
    entities: [
      {
        resourceName: 'Compute Target HTTP Proxy',
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
    dependsOn: [STEP_COMPUTE_LOADBALANCERS],
    executionHandler: fetchComputeTargetHttpProxies,
    permissions: ['compute.targetHttpProxies.list'],
    apis: ['compute.googleapis.com'],
  };
