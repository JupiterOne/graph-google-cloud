import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { STEP_PROJECT } from '../resource-manager';
import { SQLAdminClient } from './client';
import {
  STEP_SQL_ADMIN_INSTANCES,
  DATABASE_TYPE,
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
} from './constants';
import {
  createMySQLInstanceEntity,
  createPostgresInstanceEntity,
  createSQLServerInstanceEntity,
} from './converters';

export * from './constants';

export async function fetchSQLAdminInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new SQLAdminClient({ config });

  await client.iterateCloudSQLInstances(async (instance) => {
    if (!instance?.databaseVersion) {
      logger.info(
        'Skipping cloud SQL instance resource where instance.databaseVersion is undefined',
      );
      return;
    }

    if (instance.databaseVersion?.toUpperCase().includes(DATABASE_TYPE.MYSQL)) {
      await jobState.addEntity(createMySQLInstanceEntity(instance));
    } else if (
      instance.databaseVersion?.toUpperCase().includes(DATABASE_TYPE.POSTGRES)
    ) {
      await jobState.addEntity(createPostgresInstanceEntity(instance));
    } else if (
      instance.databaseVersion?.toUpperCase().includes(DATABASE_TYPE.SQL_SERVER)
    ) {
      await jobState.addEntity(createSQLServerInstanceEntity(instance));
    }
  });
}

export const sqlAdminSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_SQL_ADMIN_INSTANCES,
    name: 'SQL Admin Instances',
    entities: [
      {
        resourceName: 'SQL Admin MySQL Instance',
        _type: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
      },
      {
        resourceName: 'SQL Admin Postgres Instance',
        _type: SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
      },
      {
        resourceName: 'SQL Admin SQL Server Instance',
        _type: SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
        _class: SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_PROJECT],
    executionHandler: fetchSQLAdminInstances,
  },
];
