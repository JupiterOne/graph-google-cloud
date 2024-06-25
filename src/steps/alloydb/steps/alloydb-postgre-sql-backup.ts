import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { AlloyDBClient } from '../client';
import {
  AlloyDBPermissions,
  Entities,
  IngestionSources,
  STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
} from '../constants';
import { createBackupEntity } from '../converter';

export async function fetchAlloyDBPostgreSQLBackup(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new AlloyDBClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateAlloyDBPostgreSQLBackup(async (backup) => {
    await jobState.addEntity(createBackupEntity(backup));
  });
}

export const alloyDBPostgreSQLBackupStep: GoogleCloudIntegrationStep = {
  id: STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
  ingestionSourceId: IngestionSources.ALLOYDB_POSTGRE_SQL_BACKUP,
  name: 'fetch-alloydb-postgre-sql-backup',
  entities: [
    Entities.ALLOYDB_POSTGRE_SQL_BACKUP
  ],
  relationships: [],
  dependsOn: [],
  permissions: AlloyDBPermissions.STEP_ALLOYDB_POSTGRE_SQL_BACKUP,
  executionHandler: fetchAlloyDBPostgreSQLBackup,
  apis: ['alloydb.googleapis.com'],
};
