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
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
  ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
  ENTITY_CLASS_COMPUTE_GLOBAL_FORWARDING_RULE,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
} from '../constants';
import { createComputeGlobalForwardingRuleEntity } from '../converters';

export async function fetchComputeGlobalForwardingRules(
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

  await client.iterateGlobalForwardingRules(async (forwardingRule) => {
    const forwardingRuleEntity =
      createComputeGlobalForwardingRuleEntity(forwardingRule);
    await jobState.addEntity(forwardingRuleEntity);

    // Should be non-region backend service (requires more testing to be 100% sure)
    if (forwardingRule.backendService) {
      const backendServiceEntity = await jobState.findEntity(
        forwardingRule.backendService,
      );
      if (backendServiceEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: backendServiceEntity,
          }),
        );
      }
    }

    if (forwardingRule.subnetwork) {
      const subnetworkEntity = await jobState.findEntity(
        forwardingRule.subnetwork,
      );
      if (subnetworkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: subnetworkEntity,
          }),
        );
      }
    }

    if (forwardingRule.network) {
      const networkEntity = await jobState.findEntity(forwardingRule.network);
      if (networkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: networkEntity,
          }),
        );
      }
    }

    // The target can be target proxy or target pool
    // Future: We may need to expect proxy SSL type here too
    // Future: We also may want to ingest google_compute_target_pool so that we can build a relationship with it here
    if (forwardingRule.target) {
      const targetEntity = await jobState.findEntity(forwardingRule.target);
      if (targetEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: targetEntity,
          }),
        );
      }
    }
  });
}
export const fetchComputeGlobalForwardingRulesStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
    ingestionSourceId: IngestionSources.COMPUTE_GLOBAL_FORWARDING_RULES,
    name: 'Compute Global Forwarding Rules',
    entities: [
      {
        resourceName: 'Compute Global Forwarding Rule',
        _type: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        _class: ENTITY_CLASS_COMPUTE_GLOBAL_FORWARDING_RULE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_BACKEND_SERVICES,
      STEP_COMPUTE_NETWORKS,
      STEP_COMPUTE_SUBNETWORKS,
      STEP_COMPUTE_TARGET_HTTP_PROXIES,
      STEP_COMPUTE_TARGET_HTTPS_PROXIES,
    ],
    executionHandler: fetchComputeGlobalForwardingRules,
    permissions: ['compute.globalForwardingRules.list'],
    apis: ['compute.googleapis.com'],
  };
