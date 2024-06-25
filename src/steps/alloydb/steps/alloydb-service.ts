import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  Entities,
  IngestionSources,
  STEP_ALLOYDB_POSTGRE_SQL_SERVICE,
} from '../constants';
import { getAlloyDBforPostgreSQLServiceEntity } from '../converter';

export async function createAlloyDBForPostgreSQL(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = context;

  const projectId = instance.config.projectId;
  const organizationId = instance.config.organizationId;
  const instanceId = instance.id;

  await jobState.addEntity(
    getAlloyDBforPostgreSQLServiceEntity({
      projectId,
      organizationId,
      instanceId,
    }),
  );
}

export const alloyDBPostgreSQLServiceStep: GoogleCloudIntegrationStep = {
  id: STEP_ALLOYDB_POSTGRE_SQL_SERVICE,
  ingestionSourceId: IngestionSources.ALLOYDB_POSTGRE_SQL_SERVICE,
  name: 'AlloyDB Postgre SQL',
  entities: [
    Entities.ALLOYDB_POSTGRE_SQL_SERVICE
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: createAlloyDBForPostgreSQL,
};
