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
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
  ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
  RELATIONSHIP_TYPE_STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP,
  STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP,
  STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
} from '../constants';

import { getKey } from '../converter';
import { IngestionSources } from '../constants';

export async function buildAlloyDBInstanceHasConnectionRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE },
    async (instance) => {
      const connectionKey = getKey(
        ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
        instance.uid,
      );

      if (!jobState.hasKey(connectionKey)) {
        throw new IntegrationMissingKeyError(`
          Step Name: Build AlloyDb Instance Has Connecction Relationship
          Entity Name: AlloyDB Connection,
          Key: ${connectionKey} 
          `);
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: instance._key,
          fromType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
          toKey: connectionKey,
          toType: ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
        }),
      );
    },
  );
}

export const buildAlloyDBInstanceHasConnectionRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP,
    ingestionSourceId:
      IngestionSources.ALLOYDB_INSTANCE_HAS_CONNECTION_RELATIONSHIP,
    name: 'Build AlloyDb Instance Has Connecction Relationship',
    entities: [],
    relationships: [
      {
        _type: RELATIONSHIP_TYPE_STEP_ALLOYDB_INSTANCE_HAS_CONNECTION_BACKUP,
        sourceType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
        _class: RelationshipClass.HAS,
        targetType: ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
      },
    ],
    dependsOn: [
      STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
      STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
    ],
    executionHandler: buildAlloyDBInstanceHasConnectionRelationship,
  };
