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
  STEP_COMPUTE_NETWORKS,
  ENTITY_TYPE_COMPUTE_NETWORK,
  STEP_COMPUTE_SUBNETWORKS,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  STEP_COMPUTE_ADDRESSES,
  ENTITY_TYPE_COMPUTE_ADDRESS,
  ENTITY_CLASS_COMPUTE_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_ADDRESS,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  RELATIONSHIP_TYPE_COMPUTE_INSTANCE_USES_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_USES_ADDRESS,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_FORWARDING_RULES,
} from '../constants';
import { createComputeAddressEntity } from '../converters';

export async function fetchComputeAddresses(
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

  await client.iterateComputeAddresses(async (address) => {
    const addressEntity = await jobState.addEntity(
      createComputeAddressEntity(address, client.projectId),
    );

    // Subnetwork -> HAS -> Compute Address
    if (address.subnetwork) {
      const subnetworkEntity = await jobState.findEntity(address.subnetwork);
      if (subnetworkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: subnetworkEntity,
            to: addressEntity,
          }),
        );
      }
    }

    // Network -> HAS -> Compute Address (might be redundant because Network -> HAS -> Subnetwork?)
    if (address.network) {
      const networkEntity = await jobState.findEntity(address.network);
      if (networkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: networkEntity,
            to: addressEntity,
          }),
        );
      }
    }

    // *Some* resource is using the address (address's users' array contains selfLinks)
    // Right now we know (from examples) that those resources include: Instance, ForwardingRule (non-region type)
    // There may be more, we can keep adding here
    if (address.users) {
      for (const user of address.users) {
        const resourceUser = await jobState.findEntity(user);
        if (resourceUser) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.USES,
              from: resourceUser,
              to: addressEntity,
            }),
          );
        }
      }
    }
  });
}

export const fetchComputeAddressesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_ADDRESSES,
  ingestionSourceId: IngestionSources.COMPUTE_ADDRESSES,
  name: 'Compute Addresses',
  entities: [
    {
      resourceName: 'Compute Address',
      _type: ENTITY_TYPE_COMPUTE_ADDRESS,
      _class: ENTITY_CLASS_COMPUTE_ADDRESS,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ADDRESS,
      sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
      targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
    },
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_ADDRESS,
      sourceType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
    },
    {
      _class: RelationshipClass.USES,
      _type: RELATIONSHIP_TYPE_COMPUTE_INSTANCE_USES_ADDRESS,
      sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
      targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
    },
    {
      _class: RelationshipClass.USES,
      _type: RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_USES_ADDRESS,
      sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
      targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
    },
  ],
  dependsOn: [
    STEP_COMPUTE_NETWORKS,
    STEP_COMPUTE_SUBNETWORKS,
    STEP_COMPUTE_INSTANCES,
    STEP_COMPUTE_FORWARDING_RULES,
  ],
  executionHandler: fetchComputeAddresses,
  permissions: ['compute.addresses.list'],
  apis: ['compute.googleapis.com'],
};
