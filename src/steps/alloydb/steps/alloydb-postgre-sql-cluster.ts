import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { AlloyDBClient } from '../client';
import {
  AlloyDBPermissions,
  Entities,
  IngestionSources,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
} from '../constants';
import { createAlloyDbClusterEntity } from '../converter';

export async function fetchAlloyDBPostgreSQLCluster(
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
    Entities.ALLOYDB_POSTGRE_SQL_CLUSTER
  ],
  relationships: [],
  dependsOn: [],
  permissions: AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  executionHandler: fetchAlloyDBPostgreSQLCluster,
  apis: ['alloydb.googleapis.com'],
};
