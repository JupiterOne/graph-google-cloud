import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { AlloyDBClient } from '../client';
import {
  AlloyDBPermissions,
  ENTITY_CLASS_POSTGRE_SQL_CLUSTER,
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  IngestionSources,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
} from '../constants';
import { createAlloyDbClusterEntity } from '../converter';

export async function createAlloyDBPostgreSQLCluster(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new AlloyDBClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateAlloyDBPostgreSQLClusters(async (cluster) => {
    await jobState.addEntity(createAlloyDbClusterEntity(cluster));
  });
}

export const alloyDBPostgreSQLClusterStep: GoogleCloudIntegrationStep = {
  id: STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  ingestionSourceId: IngestionSources.ALLOYDB_POSTGRE_SQL_CLUSTER,
  name: 'fetch-alloydb-postgre-sql-cluster',
  entities: [
    {
      resourceName: ' AlloyDB for PostgreSQL Cluster',
      _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
      _class: ENTITY_CLASS_POSTGRE_SQL_CLUSTER,
    },
  ],
  relationships: [],
  dependsOn: [],
  permissions: AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  executionHandler: createAlloyDBPostgreSQLCluster,
  apis: ['alloydb.googleapis.com'],
};
