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
  STEP_COMPUTE_SSL_POLICIES,
  ENTITY_TYPE_COMPUTE_SSL_POLICY,
  ENTITY_CLASS_COMPUTE_SSL_POLICY,
  RELATIONSHIP_TYPE_TARGET_HTTPS_PROXY_HAS_SSL_POLICY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_TARGET_SSL_PROXY_HAS_SSL_POLICY,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
} from '../constants';
import { createSslPolicyEntity } from '../converters';

export async function fetchComputeSslPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateSslPolicies(async (sslPolicy) => {
    const sslPolicyEntity = createSslPolicyEntity(sslPolicy);
    await jobState.addEntity(sslPolicyEntity);

    // TARGET_HTTPS_PROXY -> HAS -> SSL_POLICY
    await jobState.iterateEntities(
      {
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
      async (targetHttpsProxyEntity) => {
        if (
          (targetHttpsProxyEntity.sslPolicy as string) === sslPolicy.selfLink
        ) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: targetHttpsProxyEntity,
              to: sslPolicyEntity,
            }),
          );
        }
      },
    );

    // TARGET_SSL_PROXY -> HAS -> SSL_POLICY
    await jobState.iterateEntities(
      {
        _type: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
      },
      async (targetSslProxyEntity) => {
        if ((targetSslProxyEntity.sslPolicy as string) === sslPolicy.selfLink) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: targetSslProxyEntity,
              to: sslPolicyEntity,
            }),
          );
        }
      },
    );
  });
}

export const fetchComputeSslPoliciesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_SSL_POLICIES,
  ingestionSourceId: IngestionSources.COMPUTE_SSL_POLICIES,
  name: 'Compute SSL Policies',
  entities: [
    {
      resourceName: 'Compute SSL Policy',
      _type: ENTITY_TYPE_COMPUTE_SSL_POLICY,
      _class: ENTITY_CLASS_COMPUTE_SSL_POLICY,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_TARGET_HTTPS_PROXY_HAS_SSL_POLICY,
      sourceType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      targetType: ENTITY_TYPE_COMPUTE_SSL_POLICY,
    },
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_TARGET_SSL_PROXY_HAS_SSL_POLICY,
      sourceType: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
      targetType: ENTITY_TYPE_COMPUTE_SSL_POLICY,
    },
  ],
  dependsOn: [
    STEP_COMPUTE_TARGET_HTTPS_PROXIES,
    STEP_COMPUTE_TARGET_SSL_PROXIES,
  ],
  executionHandler: fetchComputeSslPolicies,
  permissions: ['compute.sslPolicies.list'],
  apis: ['compute.googleapis.com'],
};
