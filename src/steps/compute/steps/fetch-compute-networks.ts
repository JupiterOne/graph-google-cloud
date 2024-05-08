import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { setNetworkPeerings, setPeeredNetworks } from '../../../utils/jobState';
import { ComputeClient } from '../client';
import {
  IngestionSources,
  STEP_COMPUTE_NETWORKS,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_CLASS_COMPUTE_NETWORK,
  ComputePermissions,
} from '../constants';
import { createComputeNetworkEntity } from '../converters';

export async function fetchComputeNetworks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new ComputeClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  const peeredNetworks: string[] = [];

  await client.iterateNetworks(async (network) => {
    await jobState.addEntity(
      createComputeNetworkEntity(network, client.projectId),
    );

    if (network.peerings?.length) {
      await setNetworkPeerings(
        jobState,
        network.selfLink as string,
        network.peerings || [],
      );
      peeredNetworks.push(network.selfLink as string);
    }
  });

  await setPeeredNetworks(jobState, peeredNetworks);
}
export const fetchComputeNetworksStepMap: GoogleCloudIntegrationStep = {
  id: STEP_COMPUTE_NETWORKS,
  ingestionSourceId: IngestionSources.COMPUTE_NETWORKS,
  name: 'Compute Networks',
  entities: [
    {
      resourceName: 'Compute Networks',
      _type: ENTITY_TYPE_COMPUTE_NETWORK,
      _class: ENTITY_CLASS_COMPUTE_NETWORK,
    },
  ],
  relationships: [],
  executionHandler: fetchComputeNetworks,
  permissions: ComputePermissions.STEP_COMPUTE_NETWORKS,
  apis: ['compute.googleapis.com'],
};
