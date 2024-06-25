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
  Relationships,
  STEP_ALLOYDB_CLUSTER_USES_KMS_KEY_RELATIONSHIP,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
} from '../constants';

import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../../kms';

export async function buildAlloyDBClusterUseskmsKeyRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER },
    async (cluster) => {
      const kmsCryptoKey = cluster.kmsKeyName as string;

      if (!kmsCryptoKey) return;

      if (!jobState.hasKey(kmsCryptoKey)) {
        logger.warn(`
            Step Name: Build AlloyDb Cluster Has Backup Relationship
            Entity Name: KMS Crypto Key,
            Key: ${kmsCryptoKey} 
            `);
      }else{
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromKey: cluster._key,
            fromType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
            toKey: kmsCryptoKey,
            toType: ENTITY_TYPE_KMS_KEY,
          }),
        );
      }

    },
  );
}

export const buildAlloyDBClusterUsesKMSKeyRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_ALLOYDB_CLUSTER_USES_KMS_KEY_RELATIONSHIP,
    name: 'Build AlloyDb Cluster Uses Kms Key Relationship',
    entities: [],
    relationships: [
      Relationships.ALLOYDB_CLUSTER_USES_KMS_KEY
    ],
    dependsOn: [STEP_CLOUD_KMS_KEYS, STEP_ALLOYDB_POSTGRE_SQL_CLUSTER],
    executionHandler: buildAlloyDBClusterUseskmsKeyRelationship,
  };
