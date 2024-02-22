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
  STEP_COMPUTE_GLOBAL_ADDRESSES,
  ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
  ENTITY_CLASS_COMPUTE_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS,
} from '../constants';
import { createComputeGlobalAddressEntity } from '../converters';

export async function fetchComputeGlobalAddresses(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateComputeGlobalAddresses(async (address) => {
    const addressEntity = createComputeGlobalAddressEntity(
      address,
      client.projectId,
    );
    await jobState.addEntity(addressEntity);

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
  });
}

export const fetchComputeGlobalAddressesStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_GLOBAL_ADDRESSES,
  ingestionSourceId: IngestionSources.COMPUTE_GLOBAL_ADDRESSES,
  name: 'Compute Global Addresses',
  entities: [
    {
      resourceName: 'Compute Global Address',
      _type: ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
      _class: ENTITY_CLASS_COMPUTE_GLOBAL_ADDRESS,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS,
      sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
      targetType: ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
    },
    {
      _class: RelationshipClass.HAS,
      _type: RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS,
      sourceType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      targetType: ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
    },
  ],
  dependsOn: [STEP_COMPUTE_NETWORKS, STEP_COMPUTE_SUBNETWORKS],
  executionHandler: fetchComputeGlobalAddresses,
  permissions: ['compute.globalAddresses.list'],
  apis: ['compute.googleapis.com'],
};
