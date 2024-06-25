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
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
  Relationships,
  STEP_ALLOYDB_INSTANCE_USES_CLUSTER_RELATIONSHIP,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
} from '../constants';

import { getKey } from '../converter';

export async function buildAlloyDBInstanceUsesClusterRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE },
    async (instance) => {
      const instanceName = instance.name as string;

      const clusterName = instanceName.substring(
        0,
        instanceName.indexOf('/instances'),
      );
      const clusterKey = getKey(
        ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
        clusterName,
      );

      if (!jobState.hasKey(clusterKey)) {
        logger.warn(`
        Step Name: Build Alloydb Instance Uses Cluster Relationship
        Cluster Key: ${clusterKey}
        `);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            fromKey: instance._key as string,
            fromType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
            toKey: clusterKey,
            toType: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
          }),
        );
      }
    },
  );
}

export const buildInstanceClusterRelationshipStep: GoogleCloudIntegrationStep =
  {
    id: STEP_ALLOYDB_INSTANCE_USES_CLUSTER_RELATIONSHIP,
    name: 'Build Alloydb Instance Uses Cluster Relationship',
    entities: [],
    relationships: [Relationships.ALLOYDB_INSTANCE_USES_CLUSTER],
    dependsOn: [
      STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
      STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
    ],
    executionHandler: buildAlloyDBInstanceUsesClusterRelationship,
  };
