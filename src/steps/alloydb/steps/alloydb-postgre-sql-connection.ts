import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { AlloyDBClient } from '../client';
import {
  AlloyDBPermissions,
  ENTITY_CLASS_POSTGRE_SQL_CONNECTION,
  ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
  ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE,
  IngestionSources,
  STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
  STEP_ALLOYDB_POSTGRE_SQL_INSTANCE,
} from '../constants';
import { createConnectionEntity } from '../converter';

export async function fetchAlloyDBPostgreSQLConnection(
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
    { _type: ENTITY_TYPE_POSTGRE_SQL_ALLOYDB_INSTANCE },
    async (instance) => {
      const location = instance.clsusterLocation;
      const instanceName = instance.instanceName;
      const clusterName = instance.clusterName;

      await client.iterateAlloyDBPostgreSQLConnectionInfo(
        location,
        clusterName,
        instanceName,
        async (connectionInfo) => {
          await jobState.addEntity(createConnectionEntity(connectionInfo));
        },
      );
    },
  );
}

export const alloyDBPostgreSQLConnectionStep: GoogleCloudIntegrationStep = {
  id: STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
  ingestionSourceId: IngestionSources.ALLOYDB_POSTGRE_SQL_CONNECTION,
  name: 'fetch-alloydb-postgre-sql-connection',
  entities: [
    {
      resourceName: 'AlloyDB for PostgreSQL Connection',
      _type: ENTITY_TYPE_POSTGRE_SQL_CONNECTION,
      _class: ENTITY_CLASS_POSTGRE_SQL_CONNECTION,
    },
  ],
  relationships: [],
  dependsOn: [STEP_ALLOYDB_POSTGRE_SQL_INSTANCE],
  permissions: AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_CONNECTION,
  executionHandler: fetchAlloyDBPostgreSQLConnection,
  apis: ['alloydb.googleapis.com'],
};
