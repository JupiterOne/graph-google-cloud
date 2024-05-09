import {
  createDirectRelationship,
  IntegrationMissingKeyError,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { CloudSqlClient } from './client';
import {
  IngestionSources,
  STEP_CLOUD_SQL,
  ENTITY_TYPE_CLOUD_SQL,
  ENTITY_CLASS_CLOUD_SQL,
  STEP_CLOUD_SQL_INSTANCES,
  ENTITY_CLASS_CLOUD_SQL_INSTANCES,
  ENTITY_TYPE_CLOUD_SQL_INSTANCES,
  STEP_CLOUD_SQL_SSL_CERTIFICATION,
  ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
  ENTITY_CLASS_CLOUD_SQL_SSL_CERTIFICATION,
  STEP_CLOUD_SQL_BACKUP,
  ENTITY_TYPE_CLOUD_SQL_BACKUP,
  ENTITY_CLASS_CLOUD_SQL_BACKUP,
  STEP_CLOUD_SQL_CONNECTION,
  ENTITY_TYPE_CLOUD_SQL_CONNECTION,
  ENTITY_CLASS_CLOUD_SQL_CONNECTION,
  ENTITY_TYPE_CLOUD_SQL_DATABASE,
  ENTITY_CLASS_CLOUD_SQL_DATABASE,
  STEP_CLOUD_SQL_DATABASE,
  STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
  RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
  STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
  RELATIONSHIP_TYPE_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
  STEP_CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP,
  RELATIONSHIP_TYPE_CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP,
  STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
  RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
  STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
  RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
  STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
  RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
  STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
  STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
  RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
  STEP_CLOUD_USER,
  ENTITY_TYPE_CLOUD_USER,
  ENTITY_CLASS_CLOUD_USER,
  STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
} from './constants';
import {
  createCloudSqlBackupEntity,
  createCloudSqlConnectionEntity,
  createCloudSqlDatabaseEntity,
  createCloudSqlInstancesEntity,
  createCloudSqlServiceEntity,
  createCloudSslCertificationEntity,
  createCloudUserEntity,
} from './converters';
import { PROJECT_ENTITY_TYPE, STEP_RESOURCE_MANAGER_PROJECT } from '../resource-manager';
import { getProjectEntity } from '../../utils/project';
import { GOOGLE_USER_ENTITY_TYPE } from '../iam/constants';

export async function fetchCloudSql(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudSqlClient({ config }, logger);
  await jobState.addEntity(createCloudSqlServiceEntity(client.projectId));
}

export async function fetchCloudSqlInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudSqlClient({ config }, logger);

  await client.iterateCloudSqlInstances(async (sqlInstance) => {
    const sqlInstanceEntity = createCloudSqlInstancesEntity(sqlInstance);
    await jobState.addEntity(sqlInstanceEntity);
  });
}

export async function fetchCloudSslCertification(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudSqlClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_INSTANCES },
    async (sqlInstanceEntity) => {
      const instanceName = sqlInstanceEntity.name as string
      await client.iterateCloudSslCertification(instanceName, async (sslCertification) => {
        const cloudSslCertificationEntity = createCloudSslCertificationEntity(sslCertification);
        await jobState.addEntity(cloudSslCertificationEntity);
      });
    },
  );
}

export async function fetchCloudSqlBackup(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudSqlClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_INSTANCES },
    async (sqlInstanceEntity) => {
      const instanceName = sqlInstanceEntity.name as string
      await client.iterateCloudSqlBackup(instanceName, async (cloudSqlBackup) => {
        const cloudSqlBackupEntity = createCloudSqlBackupEntity(cloudSqlBackup);
        await jobState.addEntity(cloudSqlBackupEntity);
      });
    },
  );
}

export async function fetchCloudSqlConnection(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudSqlClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_INSTANCES },
    async (sqlInstanceEntity) => {
      const instanceName = sqlInstanceEntity.name as string
      await client.iterateCloudSqlConnection(instanceName, async (cloudSqlConnection) => {
        const cloudSqlConnectionEntity = createCloudSqlConnectionEntity(cloudSqlConnection);
        await jobState.addEntity(cloudSqlConnectionEntity);
      });
    },
  );
}

export async function fetchCloudSqlDatabase(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudSqlClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_INSTANCES },
    async (sqlInstanceEntity) => {
      const instanceName = sqlInstanceEntity.name as string
      await client.iterateCloudSqlDatabase(instanceName, async (cloudSqlDatabase) => {
        const cloudSqlBackupEntity = createCloudSqlDatabaseEntity(cloudSqlDatabase);
        await jobState.addEntity(cloudSqlBackupEntity);
      });
    },
  );
}

export async function fetchCloudUser(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudSqlClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_INSTANCES },
    async (sqlInstanceEntity) => {
      const instanceName = sqlInstanceEntity.name as string
      await client.iterateCloudUser(instanceName, async (cloudUser) => {
        const cloudSqlBackupEntity = createCloudUserEntity(cloudUser);
        await jobState.addEntity(cloudSqlBackupEntity);
      });
    },
  );
}

export async function buildProjectHasRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL },
    async (cloudsql) => {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: projectEntity._key as string,
          fromType: PROJECT_ENTITY_TYPE,
          toKey: cloudsql._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL,
        }),
      );
    },
  );
}

export async function buildSqlHasSqlInstancesRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_INSTANCES },
    async (cloudSqlInstanceEntity) => {

      const sqlEntityKey = cloudSqlInstanceEntity.projectId


      if (!sqlEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          sqlEntityKey : ${sqlEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: sqlEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL,
          toKey: cloudSqlInstanceEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        }),
      );
    },
  );
}

export async function buildSqlSslCertificationHasSqlBackupRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_BACKUP },
    async (cloudSqlBackupEntity) => {

      const cloudSslCertificationEntityKey = cloudSqlBackupEntity.projectId

      if (!cloudSslCertificationEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          cloudSslCertificationEntityKey : ${cloudSslCertificationEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: cloudSslCertificationEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
          toKey: cloudSqlBackupEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL_BACKUP,
        }),
      );
    },
  );
}

export async function buildSqlInstanceHasSqlBackupRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_BACKUP },
    async (cloudSqlBackupEntity) => {

      const sqlInstanceEntityKey = cloudSqlBackupEntity.instanceName

      if (!sqlInstanceEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          sqlInstanceEntityKey : ${sqlInstanceEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: sqlInstanceEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
          toKey: cloudSqlBackupEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
        }),
      );
    },
  );
}


export async function buildSqlInstanceUsesSqlSslRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION },
    async (sslCertificationEntity) => {

      const sqlInstanceEntityKey = sslCertificationEntity.instanceName

      if (!sqlInstanceEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          sqlInstanceEntityKey : ${sqlInstanceEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: sqlInstanceEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
          toKey: sslCertificationEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
        }),
      );
    },
  );
}

export async function buildSqlInstanceUsesSqldatabaseRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_DATABASE },
    async (sqlDatabseEntity) => {

      const sqlInstanceEntityKey = sqlDatabseEntity.instanceName

      if (!sqlInstanceEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          sqlInstanceEntityKey : ${sqlInstanceEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          fromKey: sqlInstanceEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
          toKey: sqlDatabseEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL_DATABASE,
        }),
      );
    },
  );
}

export async function buildSqlInstanceHasSqlConnectionRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_CONNECTION },
    async (cloudSqlConnectionEntityEntity) => {

      const sqlInstanceEntityKey = cloudSqlConnectionEntityEntity.instanceName

      if (!sqlInstanceEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          sqlInstanceEntityKey : ${sqlInstanceEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: sqlInstanceEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
          toKey: cloudSqlConnectionEntityEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL_CONNECTION,
        }),
      );
    },
  );
}

export async function buildSqlInstanceAssignedGoogleUserRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_USER },
    async (userEntity) => {

      const sqlInstanceEntityKey = userEntity.instanceName

      if (!sqlInstanceEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          sqlInstanceEntityKey : ${sqlInstanceEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.ASSIGNED,
          fromKey: sqlInstanceEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
          toKey: userEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_USER,
        }),
      );
    },
  );
}

export async function buildSqlHasSqldatabaseRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_SQL_DATABASE },
    async (sqlDatabseEntity) => {

      const sqlEntityKey = sqlDatabseEntity.projectId

      if (!sqlEntityKey) {
        throw new IntegrationMissingKeyError(
          `Cannot build Relationship.
          Error: Missing Key.
          sqlEntityKey : ${sqlEntityKey}`,
        );
      }
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.ASSIGNED,
          fromKey: sqlEntityKey as string,
          fromType: ENTITY_TYPE_CLOUD_SQL,
          toKey: sqlDatabseEntity._key as string,
          toType: ENTITY_TYPE_CLOUD_SQL_DATABASE,
        }),
      );
    },
  );
}

export const cloudSqlSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_CLOUD_SQL,
    ingestionSourceId: IngestionSources.CLOUD_SQL,
    name: 'Cloud SQL',
    entities: [
      {
        resourceName: 'Cloud SQL Service',
        _type: ENTITY_TYPE_CLOUD_SQL,
        _class: ENTITY_CLASS_CLOUD_SQL,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCloudSql,
    permissions: [],
  },
  {
    id: STEP_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
    ingestionSourceId:
      IngestionSources.CLOUD_PROJECT_HAS_CLOUD_SQL,
    name: 'Project HAS cloud sql',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
        sourceType: PROJECT_ENTITY_TYPE,
        targetType: ENTITY_TYPE_CLOUD_SQL,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_CLOUD_SQL,
    ],
    executionHandler: buildProjectHasRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_INSTANCES,
    ingestionSourceId: IngestionSources.CLOUD_SQL_INSTANCES,
    name: 'Cloud SQL Instances',
    entities: [
      {
        resourceName: 'Cloud SQL Instances',
        _type: ENTITY_CLASS_CLOUD_SQL_INSTANCES,
        _class: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCloudSqlInstances,
    permissions: [],
  },
  {
    id: STEP_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
    name: 'Sql HAS Sql Instances',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_CLOUD_SQL_HAS_CLOUD_SQL_INSTANCES,
        sourceType: ENTITY_TYPE_CLOUD_SQL,
        targetType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
      },
    ],
    dependsOn: [
      STEP_CLOUD_SQL_INSTANCES,
      STEP_CLOUD_SQL,
    ],
    executionHandler: buildSqlHasSqlInstancesRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_SSL_CERTIFICATION,
    ingestionSourceId: IngestionSources.CLOUD_SQL_SSL_CERTIFICATION,
    name: 'Cloud SQL Instances',
    entities: [
      {
        resourceName: 'Cloud SQL Instances',
        _type: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
        _class: ENTITY_CLASS_CLOUD_SQL_SSL_CERTIFICATION,
      },
    ],
    relationships: [],
    dependsOn: [STEP_CLOUD_SQL_INSTANCES],
    executionHandler: fetchCloudSslCertification,
    permissions: [],
  },
  {
    id: STEP_CLOUD_SQL_BACKUP,
    ingestionSourceId: IngestionSources.CLOUD_SQL_BACKUP,
    name: 'Cloud SQL Backup',
    entities: [
      {
        resourceName: 'Cloud SQL Backup',
        _type: ENTITY_TYPE_CLOUD_SQL_BACKUP,
        _class: ENTITY_CLASS_CLOUD_SQL_BACKUP,
      },
    ],
    relationships: [],
    dependsOn: [STEP_CLOUD_SQL_INSTANCES],
    executionHandler: fetchCloudSqlBackup,
    permissions: [],
  },
  // {
  //   id: STEP_CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP,
  //   ingestionSourceId:
  //     IngestionSources.CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP,
  //   name: 'Sql SSL Certification HAS Sql Backup',
  //   entities: [],
  //   relationships: [
  //     {
  //       _class: RelationshipClass.HAS,
  //       _type: RELATIONSHIP_TYPE_CLOUD_SQL_SSL_CERTIFICATION_HAS_CLOUD_SQL_BACKUP,
  //       sourceType: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
  //       targetType: ENTITY_TYPE_CLOUD_SQL_BACKUP,
  //     },
  //   ],
  //   dependsOn: [
  //     STEP_CLOUD_SQL_SSL_CERTIFICATION,
  //     STEP_CLOUD_SQL_BACKUP,
  //   ],
  //   executionHandler: buildSqlSslCertificationHasSqlBackupRelationship,
  //   permissions: [],
  //   apis: ['dataflow.googleapis.com'],
  // },
  {
    id: STEP_CLOUD_SQL_CONNECTION,
    ingestionSourceId: IngestionSources.CLOUD_SQL_CONNECTION,
    name: 'Cloud SQL Connection',
    entities: [
      {
        resourceName: 'Cloud SQL Connection',
        _type: ENTITY_TYPE_CLOUD_SQL_CONNECTION,
        _class: ENTITY_CLASS_CLOUD_SQL_CONNECTION,
      },
    ],
    relationships: [],
    dependsOn: [STEP_CLOUD_SQL_INSTANCES],
    executionHandler: fetchCloudSqlConnection,
    permissions: [],
  },
  {
    id: STEP_CLOUD_SQL_DATABASE,
    ingestionSourceId: IngestionSources.CLOUD_SQL_DATABASE,
    name: 'Cloud SQL Database',
    entities: [
      {
        resourceName: 'Cloud SQL Database',
        _type: ENTITY_TYPE_CLOUD_SQL_DATABASE,
        _class: ENTITY_CLASS_CLOUD_SQL_DATABASE,
      },
    ],
    relationships: [],
    dependsOn: [STEP_CLOUD_SQL_INSTANCES],
    executionHandler: fetchCloudSqlDatabase,
    permissions: [],
  },
  {
    id: STEP_CLOUD_USER,
    ingestionSourceId: IngestionSources.CLOUD_USER,
    name: 'Cloud User',
    entities: [
      {
        resourceName: 'Cloud User',
        _type: ENTITY_TYPE_CLOUD_USER,
        _class: ENTITY_CLASS_CLOUD_USER,
      },
    ],
    relationships: [],
    dependsOn: [STEP_CLOUD_SQL_INSTANCES],
    executionHandler: fetchCloudUser,
    permissions: [],
  },
  {
    id: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
    name: 'Cloud Sql Instances has Sql Backup',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_BACKUP,
        sourceType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        targetType: ENTITY_TYPE_CLOUD_SQL_BACKUP,
      },
    ],
    dependsOn: [
      STEP_CLOUD_SQL_INSTANCES,
      STEP_CLOUD_SQL_BACKUP,
    ],
    executionHandler: buildSqlInstanceHasSqlBackupRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
    name: 'Cloud Sql Instances Uses Sql SSL Certification',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
        sourceType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        targetType: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
      },
    ],
    dependsOn: [
      STEP_CLOUD_SQL_SSL_CERTIFICATION,
      STEP_CLOUD_SQL_INSTANCES,
    ],
    executionHandler: buildSqlInstanceUsesSqlSslRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
    name: 'Cloud Sql Instances Uses Sql SSL Certification',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_SSL_CERTIFICATION,
        sourceType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        targetType: ENTITY_TYPE_CLOUD_SQL_SSL_CERTIFICATION,
      },
    ],
    dependsOn: [
      STEP_CLOUD_SQL_SSL_CERTIFICATION,
      STEP_CLOUD_SQL_INSTANCES,
    ],
    executionHandler: buildSqlInstanceUsesSqlSslRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
    name: 'Cloud Sql Instances Uses Sql Database',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
        sourceType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        targetType: ENTITY_TYPE_CLOUD_SQL_DATABASE,
      },
    ],
    dependsOn: [
      STEP_CLOUD_SQL_DATABASE,
      STEP_CLOUD_SQL_INSTANCES,
    ],
    executionHandler: buildSqlInstanceUsesSqldatabaseRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_INSTANCES_HAS_CLOUD_SQL_CONNECTION,
    name: 'Cloud Sql Instances Has Sql Connection',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_USES_CLOUD_SQL_DATABASE,
        sourceType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        targetType: ENTITY_TYPE_CLOUD_SQL_CONNECTION,
      },
    ],
    dependsOn: [
      STEP_CLOUD_SQL_CONNECTION,
      STEP_CLOUD_SQL_INSTANCES,
    ],
    executionHandler: buildSqlInstanceHasSqlConnectionRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
    name: 'Cloud Sql Instances Assigned Google User',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.ASSIGNED,
        _type: RELATIONSHIP_TYPE_CLOUD_SQL_INSTANCES_ASSIGNED_GOOGLE_USER,
        sourceType: ENTITY_TYPE_CLOUD_SQL_INSTANCES,
        targetType: GOOGLE_USER_ENTITY_TYPE,
      },
    ],
    dependsOn: [
      STEP_CLOUD_USER,
      STEP_CLOUD_SQL_INSTANCES,
    ],
    executionHandler: buildSqlInstanceAssignedGoogleUserRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
    ingestionSourceId:
      IngestionSources.CLOUD_SQL_HAS_CLOUD_SQL_DATABASE,
    name: 'Cloud Sql Has Sql database',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_GOOGLE_CLOUD_PROJECT_HAS_CLOUD_SQL,
        sourceType: ENTITY_TYPE_CLOUD_SQL,
        targetType: ENTITY_TYPE_CLOUD_SQL_DATABASE,
      },
    ],
    dependsOn: [
      STEP_CLOUD_SQL_DATABASE,
      STEP_CLOUD_SQL,
    ],
    executionHandler: buildSqlHasSqldatabaseRelationship,
    permissions: [],
    apis: ['dataflow.googleapis.com'],
  }
]
