import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { PROJECT_ENTITY_TYPE, STEP_PROJECT } from '../resource-manager';
import { SQLAdminClient } from './client';
import {
  STEP_CLOUD_SQL_ADMIN_INSTANCES,
  DATABASE_TYPE,
  CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
  CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
  CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
} from './constants';
import {
  createCloudMySQLInstanceEntity,
  createCloudPostgresInstanceEntity,
  createCloudSQLServerInstanceEntity,
} from './converters';

export * from './constants';

export async function fetchCloudSQLInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new SQLAdminClient({ config });
  await jobState.iterateEntities(
    {
      _type: PROJECT_ENTITY_TYPE,
    },
    async (projectEntity) => {
      await client.iterateCloudSQLInstances(
        projectEntity._key as string,
        async (instance) => {
          if (!instance?.databaseVersion) {
            logger.info(
              'Skipping cloud SQL instance resource where instance.databaseVersion is undefined',
            );
            return;
          }

          if (
            instance.databaseVersion
              ?.toUpperCase()
              .includes(DATABASE_TYPE.MYSQL)
          ) {
            await jobState.addEntity(createCloudMySQLInstanceEntity(instance));
          } else if (
            instance.databaseVersion
              ?.toUpperCase()
              .includes(DATABASE_TYPE.POSTGRES)
          ) {
            await jobState.addEntity(
              createCloudPostgresInstanceEntity(instance),
            );
          } else if (
            instance.databaseVersion
              ?.toUpperCase()
              .includes(DATABASE_TYPE.SQL_SERVER)
          ) {
            await jobState.addEntity(
              createCloudSQLServerInstanceEntity(instance),
            );
          }
        },
      );
    },
  );
}

export const sqlAdminSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_CLOUD_SQL_ADMIN_INSTANCES,
    name: 'SQL Admin Cloud SQL',
    entities: [
      {
        resourceName: 'Cloud SQL Admin MySQL Instance',
        _type: CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
        _class: CLOUD_SQL_ADMIN_MYSQL_INSTANCE_ENTITY_CLASS,
      },
      {
        resourceName: 'Cloud SQL Admin Postgres Instance',
        _type: CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
        _class: CLOUD_SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_CLASS,
      },
      {
        resourceName: 'Cloud SQL Admin SQL Server Instance',
        _type: CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
        _class: CLOUD_SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [STEP_PROJECT],
    executionHandler: fetchCloudSQLInstances,
  },
];
