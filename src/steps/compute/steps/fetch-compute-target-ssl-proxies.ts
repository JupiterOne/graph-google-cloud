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
  STEP_COMPUTE_TARGET_SSL_PROXIES,
  ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_TARGET_SSL_PROXY,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  STEP_COMPUTE_BACKEND_SERVICES,
  ComputePermissions,
} from '../constants';
import { createTargetSslProxyEntity } from '../converters';

export async function fetchComputeTargetSslProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateTargetSslProxies(async (targetSslProxy) => {
    const targetSslProxyEntity = createTargetSslProxyEntity(targetSslProxy);
    await jobState.addEntity(targetSslProxyEntity);

    // NOTE - SSL load balancer is slightly different
    // targetSslProxy does not have urlMap field that points to its load balancer (like targetHttp and targetHttps do)
    // but instead, SSL load balancer actually exists as a backendService and cannot be found with urlMap

    const backendServiceEntity = await jobState.findEntity(
      targetSslProxy.service as string,
    );
    if (backendServiceEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: backendServiceEntity,
          to: targetSslProxyEntity,
        }),
      );
    }
  });
}

export const fetchComputeTargetSslProxiesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_TARGET_SSL_PROXIES,
  ingestionSourceId: IngestionSources.COMPUTE_TARGET_SSL_PROXIES,
  name: 'Compute Target SSL Proxies',
  entities: [
    {
      resourceName: 'Compute Target SSL Proxy',
      _type: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
      _class: ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_TARGET_SSL_PROXY,
      sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      targetType: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
    },
  ],
  dependsOn: [STEP_COMPUTE_BACKEND_SERVICES],
  executionHandler: fetchComputeTargetSslProxies,
  permissions: ComputePermissions.STEP_COMPUTE_TARGET_SSL_PROXIES,
  apis: ['compute.googleapis.com'],
};
