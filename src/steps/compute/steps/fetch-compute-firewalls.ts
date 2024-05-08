import {
  Entity,
  JobState,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { INTERNET } from '@jupiterone/data-model';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_CLASS_COMPUTE_FIREWALL,
  RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
  ENTITY_TYPE_COMPUTE_NETWORK,
  RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_FIREWALLS,
  ComputePermissions,
} from '../constants';
import {
  createComputeFirewallEntity,
  createFirewallRuleMappedRelationship,
} from '../converters';
import { compute_v1 } from 'googleapis';
import {
  getFirewallIpRanges,
  getFirewallRelationshipDirection,
  processFirewallRuleRelationshipTargets,
} from '../../../utils/firewall';

export async function processFirewallRuleLists({
  jobState,
  firewall,
  firewallEntity,
}: {
  jobState: JobState;
  firewall: compute_v1.Schema$Firewall;
  firewallEntity: Entity;
}) {
  const ipRanges = getFirewallIpRanges(firewall);
  const relationshipDirection = getFirewallRelationshipDirection(firewall);

  for (const [ruleIndex, rule] of (firewall.allowed || []).entries()) {
    await processFirewallRuleRelationshipTargets({
      ruleIndex,
      rule,
      ipRanges,
      callback: async (processedRuleTarget) => {
        await jobState.addRelationship(
          createFirewallRuleMappedRelationship({
            _class: RelationshipClass.ALLOWS,
            relationshipDirection,
            firewallEntity,
            ...processedRuleTarget,
          }),
        );
      },
    });
  }

  for (const [ruleIndex, rule] of (firewall.denied || []).entries()) {
    await processFirewallRuleRelationshipTargets({
      ruleIndex,
      rule,
      ipRanges,
      callback: async (processedRuleTarget) => {
        await jobState.addRelationship(
          createFirewallRuleMappedRelationship({
            _class: RelationshipClass.DENIES,
            relationshipDirection,
            firewallEntity,
            ...processedRuleTarget,
          }),
        );
      },
    });
  }
}

export async function fetchComputeFirewalls(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateFirewalls(async (firewall) => {
    const firewallEntity = await jobState.addEntity(
      createComputeFirewallEntity(firewall),
    );

    const networkEntity = await jobState.findEntity(firewall.network as string);

    if (!networkEntity) {
      // Possible that the network was created after the network entities were
      // created.
      return;
    }

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.PROTECTS,
        from: firewallEntity,
        to: networkEntity,
      }),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: networkEntity,
        to: firewallEntity,
      }),
    );

    await processFirewallRuleLists({
      jobState,
      firewall,
      firewallEntity,
    });
  });
}

export const fetchComputeFirewallsStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_FIREWALLS,
  ingestionSourceId: IngestionSources.COMPUTE_FIREWALLS,
  name: 'Compute Firewalls',
  entities: [
    {
      resourceName: 'Compute Firewalls',
      _type: ENTITY_TYPE_COMPUTE_FIREWALL,
      _class: ENTITY_CLASS_COMPUTE_FIREWALL,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.PROTECTS,
      _type: RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
      sourceType: ENTITY_TYPE_COMPUTE_FIREWALL,
      targetType: ENTITY_TYPE_COMPUTE_NETWORK,
    },
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
      sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
      targetType: ENTITY_TYPE_COMPUTE_FIREWALL,
    },
    {
      _type: MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
      sourceType: INTERNET._type,
      _class: RelationshipClass.ALLOWS,
      targetType: ENTITY_TYPE_COMPUTE_FIREWALL,
    },
  ],
  executionHandler: fetchComputeFirewalls,
  dependsOn: [STEP_COMPUTE_NETWORKS],
  permissions: ComputePermissions.STEP_COMPUTE_FIREWALLS,
  apis: ['compute.googleapis.com'],
};
