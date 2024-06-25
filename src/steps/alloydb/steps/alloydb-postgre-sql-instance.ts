import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { AlloyDBClient } from '../client';
import {
  AlloyDBPermissions,
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER,
  Entities,
  IngestionSources,
  STEP_ALLOYDB_POSTGRE_SQL_CLUSTER,
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
} from '../constants';
import { createAlloyDBInstance } from '../converter';

export async function fetchAlloyDBPostgreSQLInstance(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new AlloyDBClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_CLUSTER },
    async (cluster) => {
      const clusterName = cluster.clusterName; // name property represent resource name /../pid/../location/
      const location = cluster.location;

      await client.iterateAlloyDBPostgreSQLInstances(
        clusterName,
        location,
        async (instance) => {
          await jobState.addEntity(createAlloyDBInstance(instance));
        },
      );
    },
  );
}

export const alloyDBPostgreSQLInstanceStep: GoogleCloudIntegrationStep = {
  id: STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
  ingestionSourceId: IngestionSources.ALLOYDB_POSTGRE_SQL_INSTANCE,
  name: 'fetch-alloydb-postgre-sql-instance',
  entities: [
    Entities.ALLOYDB_POSTGRE_SQL_ALLOYDB_INSTANCE
  ],
  relationships: [],
  dependsOn: [STEP_ALLOYDB_POSTGRE_SQL_CLUSTER],
  permissions: AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
  executionHandler: fetchAlloyDBPostgreSQLInstance,
  apis: ['alloydb.googleapis.com'],
};
