import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  STEP_COMPUTE_NETWORK_ROUTER_RELATIONSHIPS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ROUTER,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_ROUTER,
  STEP_COMPUTE_ROUTER,
  STEP_COMPUTE_NETWORKS,
} from '../constants';

export async function buildComputeNetoworkRouterRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_COMPUTE_ROUTER,
    },
    async (router) => {
      // get the network key
      const networkKey = router.network as string;
      // if network key not present raise integration error
      if (!jobState.hasKey(networkKey)) {
        throw new IntegrationMissingKeyError(
          `Network Entity Key Missing : ${networkKey}`,
        );
      } else {
        // if network key present create direct relationship
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: networkKey,
            fromType: ENTITY_TYPE_COMPUTE_NETWORK,
            toKey: router._key as string,
            toType: ENTITY_TYPE_COMPUTE_ROUTER,
          }),
        );
      }
    },
  );
}

export const buildComputeNetworkRouterRelationshipsMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_NETWORK_ROUTER_RELATIONSHIPS,
    name: 'Compute Network Router Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ROUTER,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_ROUTER,
      },
    ],
    executionHandler: buildComputeNetoworkRouterRelationships,
    dependsOn: [STEP_COMPUTE_ROUTER, STEP_COMPUTE_NETWORKS],
  };
