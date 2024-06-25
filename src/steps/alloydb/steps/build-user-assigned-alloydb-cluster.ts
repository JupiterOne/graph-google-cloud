import {
  PrimitiveEntity,
  RelationshipClass,
  RelationshipDirection,
  createMappedRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  AlloyDBPermissions,
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  RELATIONSHIP_TYPE_USER_ASSIGNED_ALLOYDB_CLUSTER,
  Relationships,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
} from '../constants';

import { AlloyDBClient } from '../client';
import { parseIamMember } from '../../../utils/iam';
import { CREATE_IAM_ENTITY_MAP } from '../../resource-manager/createIamEntities';

export async function buildUserAssignedAlloyDbClusterRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER },
    async (cluster) => {
      const clusterName = cluster.clusterName; // name property represent resource name /../pid/../location/
      const location = cluster.location;

      const client = new AlloyDBClient(
        {
          config: context.instance.config,
        },
        logger,
      );
      // fetch the cluster users from google cloud
      await client.iterateAlloyDBPostgreSQLUsers(
        clusterName,
        location,
        async (user) => {
          const parsedMember = parseIamMember(`user:${user.name}`);
          const sourceEntityFunction = CREATE_IAM_ENTITY_MAP[parsedMember.type];
          let sourceEntity: Partial<PrimitiveEntity> | undefined = undefined;
          if (typeof sourceEntityFunction === 'function') {
            sourceEntity = sourceEntityFunction(parsedMember);
          } else {
            logger.warn(
              { parsedMemberType: parsedMember.type },
              'Unable to find create entity function in CREATE_IAM_ENTITY_MAP',
            );
          }

          const relationship = sourceEntity
            ? createMappedRelationship({
                _class: RelationshipClass.ASSIGNED,
                _mapping: {
                  relationshipDirection: RelationshipDirection.REVERSE,
                  sourceEntityKey: cluster._key as string,
                  targetFilterKeys: sourceEntity._key
                    ? [['_key', '_type']]
                    : [['_type', 'email']],
                  skipTargetCreation: false,
                  targetEntity: sourceEntity,
                },
                properties: {
                  _type: RELATIONSHIP_TYPE_USER_ASSIGNED_ALLOYDB_CLUSTER,
                },
              })
            : undefined;
          if (relationship) {
            await jobState.addRelationship(relationship);
          }
        },
      );
    },
  );
}

export const buildUserAssignedAlloyDbClusterRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
    name: 'Build User Assigned AlloyDb Cluster Relationship',
    entities: [],
    relationships: [
      Relationships.USER_ASSIGNED_ALLOYDB_CLUSTER
    ],
    dependsOn: [STEP_ALLOYDB_POSTGRE_SQL_CLUSTER],
    executionHandler: buildUserAssignedAlloyDbClusterRelationship,
    permissions:
      AlloyDBPermissions.STEP_USER_ASSIGNED_ALLOYDB_CLUSTER_RELATIONSHIP,
  };
