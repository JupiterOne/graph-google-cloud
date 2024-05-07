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
  ENTITY_CLASS_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
  ComputePermissions,
} from '../constants';
import { createComputeSubnetEntity } from '../converters';

export async function fetchComputeSubnetworks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateSubnetworks(async (subnet) => {
    const subnetEntity = await jobState.addEntity(
      createComputeSubnetEntity(subnet, client.projectId),
    );

    const networkEntity = await jobState.findEntity(subnet.network as string);

    if (!networkEntity) {
      // Possible that the network was created after the network entities were
      // created.
      return;
    }

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.CONTAINS,
        from: networkEntity,
        to: subnetEntity,
      }),
    );
  });
}

export const fetchComputeSubnetworksStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_SUBNETWORKS,
  ingestionSourceId: IngestionSources.COMPUTE_SUBNETWORKS,
  name: 'Compute Subnetworks',
  entities: [
    {
      resourceName: 'Compute Subnetwork',
      _type: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      _class: ENTITY_CLASS_COMPUTE_SUBNETWORK,
    },
  ],
  relationships: [
    {
      _class: RelationshipClass.CONTAINS,
      _type:
        RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
      sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
      targetType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
    },
  ],
  executionHandler: fetchComputeSubnetworks,
  dependsOn: [STEP_COMPUTE_NETWORKS],
  permissions: ComputePermissions.STEP_COMPUTE_SUBNETWORKS,
  apis: ['compute.googleapis.com'],
};
