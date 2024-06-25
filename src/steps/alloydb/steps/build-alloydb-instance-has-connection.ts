import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
  ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
  Relationships,
  STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP,
  STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
} from '../constants';

import { getKey } from '../converter';

export async function buildAlloyDBInstanceHasConnectionRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE },
    async (instance) => {
      const connectionKey = getKey(
        ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
        instance.uid,
      );

      if (!jobState.hasKey(connectionKey)) {
        logger.warn(`
          Step Name: Build AlloyDb Instance Has Connection Relationship
          Entity Name: AlloyDB Connection,
          Key: ${connectionKey} 
          `);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: instance._key,
            fromType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
            toKey: connectionKey,
            toType: ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
          }),
        );
      }
    },
  );
}

export const buildAlloyDBInstanceHasConnectionRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP,
    name: 'Build AlloyDb Instance Has Connecction Relationship',
    entities: [],
    relationships: [Relationships.ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP],
    dependsOn: [
      STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
      STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
    ],
    executionHandler: buildAlloyDBInstanceHasConnectionRelationship,
  };
