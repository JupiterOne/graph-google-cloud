import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  ENTITY_TYPE_POSTGRE_SQL_BACKUP,
  Relationships,
  STEP_ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP,
  STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
} from '../constants';

import { getKey } from '../converter';

export async function buildAlloyDBClusterHasBackupRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_BACKUP },
    async (backup) => {
      const clusterKey = getKey(
        ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
        backup.clusterName,
      );

      if (!jobState.hasKey(clusterKey)) {
        logger.warn(`
          Step Name: Build AlloyDb Cluster Has Backup Relationship
          Entity Name: AlloyDB Cluster,
          Key: ${clusterKey} 
          `);
      }else{
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: clusterKey,
            fromType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
            toKey: backup._key,
            toType: ENTITY_TYPE_POSTGRE_SQL_BACKUP,
          }),
        );
      }
    },
  );
}

export const buildAlloyDBClusterHasBackupRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_ALLOYDB_CLUSTER_HAS_BACKUP_RELATIONSHIP,
    name: 'Build AlloyDb Cluster Has Backup Relationship',
    entities: [],
    relationships: [
      Relationships.ALLOYDB_CLUSTER_HAS_BACKUP
    ],
    dependsOn: [
      STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
      STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
    ],
    executionHandler: buildAlloyDBClusterHasBackupRelationship,
  };
