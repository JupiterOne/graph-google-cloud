import {
  RelationshipClass,
  RelationshipDirection,
  createDirectRelationship,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { getNetworkPeerings, getPeeredNetworks } from '../../../utils/jobState';
import {
  STEP_COMPUTE_NETWORKS,
  ENTITY_TYPE_COMPUTE_NETWORK,
  STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
} from '../constants';
import { compute_v1 } from 'googleapis';

function buildPeeringNetworkRelationshipProperties(
  networkPeering: compute_v1.Schema$NetworkPeering,
) {
  return {
    active: networkPeering.state === 'ACTIVE',
    autoCreateRoutes: networkPeering.autoCreateRoutes,
    exportCustomRoutes: networkPeering.exportCustomRoutes,
    importCustomRoutes: networkPeering.importCustomRoutes,
    exchangeSubnetRoutes: networkPeering.exchangeSubnetRoutes,
    exportSubnetRoutesWithPublicIp:
      networkPeering.exportSubnetRoutesWithPublicIp,
    importSubnetRoutesWithPublicIp:
      networkPeering.importSubnetRoutesWithPublicIp,
  };
}

export async function buildComputeNetworkPeeringRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;

  const peeredNetworks = await getPeeredNetworks(jobState);
  for (const network of peeredNetworks || []) {
    const networkPeerings = await getNetworkPeerings(jobState, network);
    for (const networkPeering of networkPeerings || []) {
      const sourceNetwork = await jobState.findEntity(network);
      if (!sourceNetwork) {
        return;
      }

      if (
        networkPeering?.network?.split('/')[6] === instance.config.projectId
      ) {
        const targetNetwork = await jobState.findEntity(
          networkPeering.network as string,
        );
        if (!targetNetwork) {
          return;
        }

        // VPC network peering exists within this project, build direct relationship
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: sourceNetwork,
            to: targetNetwork,
            properties: {
              ...buildPeeringNetworkRelationshipProperties(networkPeering),
            },
          }),
        );
      } else {
        // VPC network peering exists across projects, build mapped relationship
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.CONNECTS,
            _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: sourceNetwork._key,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                _type: ENTITY_TYPE_COMPUTE_NETWORK,
                _key: networkPeering.network as string,
              },
            },
            properties: {
              ...buildPeeringNetworkRelationshipProperties(networkPeering),
            },
          }),
        );
      }
    }
  }
}

export const buildComputeNetworkPeeringRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
    name: 'Compute Networks Peerings',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.CONNECTS,
        _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
    ],
    dependsOn: [STEP_COMPUTE_NETWORKS],
    executionHandler: buildComputeNetworkPeeringRelationships,
  };
