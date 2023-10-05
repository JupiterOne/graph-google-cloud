import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../utils/kms';
import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../kms';
import { BigTableClient } from './client';
import {
  ENTITY_CLASS_BIG_TABLE_APP_PROFILE,
  ENTITY_CLASS_BIG_TABLE_BACKUP,
  ENTITY_CLASS_BIG_TABLE_CLUSTER,
  ENTITY_CLASS_BIG_TABLE_INSTANCE,
  ENTITY_CLASS_BIG_TABLE_TABLE,
  ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
  ENTITY_TYPE_BIG_TABLE_BACKUP,
  ENTITY_TYPE_BIG_TABLE_CLUSTER,
  ENTITY_TYPE_BIG_TABLE_INSTANCE,
  ENTITY_TYPE_BIG_TABLE_TABLE,
  RELATIONSHIP_TYPE_CLUSTER_HAS_BACKUP,
  RELATIONSHIP_TYPE_CLUSTER_USES_KMS_KEY,
  RELATIONSHIP_TYPE_INSTANCE_HAS_APP_PROFILE,
  RELATIONSHIP_TYPE_INSTANCE_HAS_CLUSTER,
  RELATIONSHIP_TYPE_INSTANCE_HAS_TABLE,
  RELATIONSHIP_TYPE_TABLE_HAS_BACKUP,
  STEP_BIG_TABLE_APP_PROFILES,
  STEP_BIG_TABLE_BACKUPS,
  STEP_BIG_TABLE_CLUSTERS,
  STEP_BIG_TABLE_INSTANCES,
  STEP_BIG_TABLE_TABLES,
} from './constants';
import {
  createAppProfileEntity,
  createBackupEntity,
  createClusterEntity,
  createInstanceEntity,
  createTableEntity,
} from './converters';

export async function fetchInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState, logger } = context;
  const client = new BigTableClient({ config: instance.config }, logger);

  await client.iterateInstances(async (instance) => {
    await jobState.addEntity(
      createInstanceEntity({
        instance,
        projectId: client.projectId,
      }),
    );
  });
}

export async function fetchAppProfiles(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState, logger } = context;
  const client = new BigTableClient({ config: instance.config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_BIG_TABLE_INSTANCE },
    async (instanceEntity) => {
      await client.iterateAppProfiles(
        instanceEntity.name as string,
        async (appProfile) => {
          const appProfileEntity = createAppProfileEntity({
            appProfile,
            projectId: client.projectId,
            instanceId: instanceEntity.name as string,
          });

          await jobState.addEntity(appProfileEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: instanceEntity,
              to: appProfileEntity,
            }),
          );
        },
      );
    },
  );
}

export async function fetchClusters(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState, logger } = context;
  const client = new BigTableClient({ config: instance.config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_BIG_TABLE_INSTANCE },
    async (instanceEntity) => {
      await client.iterateClusters(
        instanceEntity.name as string,
        async (cluster) => {
          const clusterEntity = createClusterEntity({
            cluster,
            projectId: client.projectId,
            instanceId: instanceEntity.name as string,
          });

          await jobState.addEntity(clusterEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: instanceEntity,
              to: clusterEntity,
            }),
          );

          if (cluster.encryptionConfig?.kmsKeyName) {
            const kmsKeyEntity = await jobState.findEntity(
              getKmsGraphObjectKeyFromKmsKeyName(
                cluster.encryptionConfig?.kmsKeyName,
              ),
            );

            if (kmsKeyEntity) {
              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.USES,
                  from: clusterEntity,
                  to: kmsKeyEntity,
                }),
              );
            }
          }
        },
      );
    },
  );
}

export async function fetchBackups(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState, logger } = context;
  const client = new BigTableClient({ config: instance.config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_BIG_TABLE_CLUSTER },
    async (clusterEntity) => {
      await client.iterateBackups(
        clusterEntity.name as string,
        async (backup) => {
          const backupEntity = createBackupEntity({
            backup,
            projectId: client.projectId,
            instanceId: clusterEntity.instanceId as string,
            clusterId: clusterEntity.name as string,
          });

          await jobState.addEntity(backupEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: clusterEntity,
              to: backupEntity,
            }),
          );

          const tableEntity = await jobState.findEntity(
            `bigtable_table:projects/${client.projectId}/instances/${clusterEntity.instanceId}/tables/${backup.sourceTable}`,
          );

          if (tableEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: tableEntity,
                to: backupEntity,
              }),
            );
          }
        },
      );
    },
  );
}

export async function fetchTables(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState, logger } = context;
  const client = new BigTableClient({ config: instance.config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_BIG_TABLE_INSTANCE },
    async (instanceEntity) => {
      await client.iterateTables(
        instanceEntity.name as string,
        async (table) => {
          const tableEntity = createTableEntity({
            table,
            projectId: client.projectId,
            instanceId: instanceEntity.name as string,
          });

          await jobState.addEntity(tableEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: instanceEntity,
              to: tableEntity,
            }),
          );
        },
      );
    },
  );
}

export const bigTableSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_BIG_TABLE_INSTANCES,
    name: 'Bigtable Instances',
    entities: [
      {
        _class: ENTITY_CLASS_BIG_TABLE_INSTANCE,
        _type: ENTITY_TYPE_BIG_TABLE_INSTANCE,
        resourceName: 'Bigtable Instance',
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchInstances,
    permissions: ['bigtable.instances.list'],
    apis: ['bigtable.googleapis.com'],
  },
  {
    id: STEP_BIG_TABLE_APP_PROFILES,
    name: 'Bigtable AppProfiles',
    entities: [
      {
        _class: ENTITY_CLASS_BIG_TABLE_APP_PROFILE,
        _type: ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
        resourceName: 'Bigtable AppProfile',
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_INSTANCE_HAS_APP_PROFILE,
        sourceType: ENTITY_TYPE_BIG_TABLE_INSTANCE,
        targetType: ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
      },
    ],
    dependsOn: [STEP_BIG_TABLE_INSTANCES],
    executionHandler: fetchAppProfiles,
    permissions: ['bigtable.appProfiles.list'],
    apis: ['bigtable.googleapis.com'],
  },
  {
    id: STEP_BIG_TABLE_CLUSTERS,
    name: 'Bigtable Clusters',
    entities: [
      {
        _class: ENTITY_CLASS_BIG_TABLE_CLUSTER,
        _type: ENTITY_TYPE_BIG_TABLE_CLUSTER,
        resourceName: 'Bigtable Cluster',
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_INSTANCE_HAS_CLUSTER,
        sourceType: ENTITY_TYPE_BIG_TABLE_INSTANCE,
        targetType: ENTITY_TYPE_BIG_TABLE_CLUSTER,
      },
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_CLUSTER_USES_KMS_KEY,
        sourceType: ENTITY_TYPE_BIG_TABLE_CLUSTER,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_BIG_TABLE_INSTANCES],
    executionHandler: fetchClusters,
    permissions: ['bigtable.clusters.list'],
    apis: ['bigtable.googleapis.com'],
  },
  {
    id: STEP_BIG_TABLE_BACKUPS,
    name: 'Bigtable Backups',
    entities: [
      {
        _class: ENTITY_CLASS_BIG_TABLE_BACKUP,
        _type: ENTITY_TYPE_BIG_TABLE_BACKUP,
        resourceName: 'Bigtable Backup',
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_CLUSTER_HAS_BACKUP,
        sourceType: ENTITY_TYPE_BIG_TABLE_CLUSTER,
        targetType: ENTITY_TYPE_BIG_TABLE_BACKUP,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_TABLE_HAS_BACKUP,
        sourceType: ENTITY_TYPE_BIG_TABLE_TABLE,
        targetType: ENTITY_TYPE_BIG_TABLE_BACKUP,
      },
    ],
    dependsOn: [
      STEP_BIG_TABLE_INSTANCES,
      STEP_BIG_TABLE_CLUSTERS,
      STEP_BIG_TABLE_TABLES,
      STEP_CLOUD_KMS_KEYS,
    ],
    executionHandler: fetchBackups,
    permissions: ['bigtable.backups.list'],
    apis: ['bigtable.googleapis.com'],
  },
  {
    id: STEP_BIG_TABLE_TABLES,
    name: 'Bigtable Tables',
    entities: [
      {
        _class: ENTITY_CLASS_BIG_TABLE_TABLE,
        _type: ENTITY_TYPE_BIG_TABLE_TABLE,
        resourceName: 'Bigtable Table',
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_INSTANCE_HAS_TABLE,
        sourceType: ENTITY_TYPE_BIG_TABLE_INSTANCE,
        targetType: ENTITY_TYPE_BIG_TABLE_TABLE,
      },
    ],
    dependsOn: [STEP_BIG_TABLE_INSTANCES],
    executionHandler: fetchTables,
    permissions: ['bigtable.tables.list'],
    apis: ['bigtable.googleapis.com'],
  },
];
