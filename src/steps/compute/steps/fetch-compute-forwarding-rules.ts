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
  STEP_COMPUTE_FORWARDING_RULES,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  ENTITY_CLASS_COMPUTE_FORWARDING_RULE,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK,
  ENTITY_TYPE_COMPUTE_NETWORK,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
} from '../constants';
import { createComputeForwardingRuleEntity } from '../converters';

// Depending on the load balancer and its tier, a forwarding rule is either global or regional.
// Terraform calls it "google_compute_forwarding_rule" not "google_compute_region_forwarding_rule"
// We're doing the same here
export async function fetchComputeForwardingRules(
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

  await client.iterateForwardingRules(async (forwardingRule) => {
    const forwardingRuleEntity =
      createComputeForwardingRuleEntity(forwardingRule);
    await jobState.addEntity(forwardingRuleEntity);

    // This is a *region* backend service
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

export const fetchComputeForwardingRulesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_FORWARDING_RULES,
  ingestionSourceId: IngestionSources.COMPUTE_FORWARDING_RULES,
  name: 'Compute Forwarding Rules',
  entities: [
    {
      resourceName: 'Compute Forwarding Rule',
      _type: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      _class: ENTITY_CLASS_COMPUTE_FORWARDING_RULE,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.CONNECTS,
      _type: RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
      sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
    },
    {
      _class: RelationshipClass.CONNECTS,
      _type: RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK,
      sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      targetType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
    },
    {
      _class: RelationshipClass.CONNECTS,
      _type: RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK,
      sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      targetType: ENTITY_TYPE_COMPUTE_NETWORK,
    },
    {
      _class: RelationshipClass.CONNECTS,
      _type:
        RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
      sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
    },
    {
      _class: RelationshipClass.CONNECTS,
      _type:
        RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
      sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
    },
  ],
  dependsOn: [
    STEP_COMPUTE_REGION_BACKEND_SERVICES,
    STEP_COMPUTE_NETWORKS,
    STEP_COMPUTE_SUBNETWORKS,
    STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
    STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  ],
  executionHandler: fetchComputeForwardingRules,
  permissions: ['compute.forwardingRules.list'],
  apis: ['compute.googleapis.com'],
};
