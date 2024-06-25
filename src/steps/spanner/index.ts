import {
  createDirectRelationship,
  createMappedRelationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { spanner_v1 } from 'googleapis';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { isMemberPublic } from '../../utils/iam';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../utils/kms';
import { RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY } from '../big-query';
import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../kms';
import { SpannerClient } from './client';
import {
  STEP_SPANNER_INSTANCES,
  STEP_SPANNER_INSTANCE_DATABASES,
  STEP_SPANNER_INSTANCE_CONFIGS,
  ENTITY_TYPE_SPANNER_INSTANCE,
  ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
  ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
  IngestionSources,
  SpannerPermissions,
  STEP_SPANNER_INSTANCE_DATABASES_ROLE,
  ENTITY_TYPE_SPANNER_INSTANCE_DATABASE_ROLE,
  STEP_SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE,
  STEP_SPANNER_BACKUP,
  ENTITY_TYPE_SPANNER_BACKUP,
  STEP_CLOUD_SPANNER_SERVICE,
  ENTITY_TYPE_SPANNER_SERVICE,
  STEP_SPANNER_INSTANCE_HAS_BACKUP,
  STEP_PROJECT_HAS_SPANNER_INSTANCE,
  STEP_PROJECT_HAS_SPANNER_INSTANCE_CONFIG,
  STEP_PROJECT_HAS_SPANNER_SERVICE,
  Entities,
  Relationships,
} from './constants';
import {
  createBackupEntity,
  createDatabaseRoleEntity,
  createSpannerInstanceConfiguration,
  createSpannerInstanceDatabaseEntity,
  createSpannerInstanceEntity,
  getCloudSpannerEntity,
} from './converters';
import {
  PROJECT_ENTITY_TYPE,
  STEP_RESOURCE_MANAGER_PROJECT,
} from '../resource-manager';
import { getProjectEntity } from '../../utils/project';

function isSpannerPolicyPublicAccess(
  instancePolicy: spanner_v1.Schema$Policy,
): boolean {
  for (const binding of instancePolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchSpannerInstanceConfigs(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new SpannerClient({ config }, logger);

  await client.iterateInstanceConfigs(async (instanceConfig) => {
    await jobState.addEntity(
      createSpannerInstanceConfiguration(instanceConfig),
    );
  });
}

export async function fetchSpannerInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new SpannerClient({ config }, logger);
  await client.iterateInstances(async (instance) => {
    const instanceId = instance.name?.split('/')[3];
    const instancePolicy = await client.getInstancePolicy(instanceId as string);

    if (instancePolicy) {
      const instanceEntity = createSpannerInstanceEntity({
        data: instance,
        projectId: client.projectId,
        isPublic: isSpannerPolicyPublicAccess(instancePolicy),
      });
      await jobState.addEntity(instanceEntity);

      const instanceConfigEntity = await jobState.findEntity(
        instance.config as string,
      );
      if (instanceConfigEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: instanceEntity,
            to: instanceConfigEntity,
          }),
        );
      }
    }
  });
}

export async function fetchSpannerInstanceDatabases(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new SpannerClient({ config }, logger);
  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_SPANNER_INSTANCE,
    },
    async (instanceEntity) => {
      const instanceId = (instanceEntity.name as string).split('/')[3];

      await client.iterateInstanceDatabases(instanceId, async (database) => {
        const databaseId = database.name?.split('/')[5];
        const databasePolicy = await client.getDatabasePolicy(
          instanceId,
          databaseId as string,
        );

        if (!databasePolicy) return;

        const instanceDatabaseEntity = createSpannerInstanceDatabaseEntity({
          data: database,
          projectId: client.projectId,
          isPublic: isSpannerPolicyPublicAccess(databasePolicy),
        });
        await jobState.addEntity(instanceDatabaseEntity);

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: instanceEntity,
            to: instanceDatabaseEntity,
          }),
        );

        if (database.encryptionConfig?.kmsKeyName) {
          const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(
            database.encryptionConfig.kmsKeyName,
          );

          const cryptoKeyEntity = await jobState.findEntity(kmsKey);
          if (cryptoKeyEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: instanceDatabaseEntity,
                to: cryptoKeyEntity,
              }),
            );
          } else {
            await jobState.addRelationship(
              createMappedRelationship({
                _class: RelationshipClass.USES,
                _type: RELATIONSHIP_TYPE_DATASET_USES_KMS_CRYPTO_KEY,
                _mapping: {
                  relationshipDirection: RelationshipDirection.FORWARD,
                  sourceEntityKey: instanceDatabaseEntity._key,
                  targetFilterKeys: [['_type', '_key']],
                  skipTargetCreation: true,
                  targetEntity: {
                    _type: ENTITY_TYPE_KMS_KEY,
                    _key: kmsKey,
                  },
                },
              }),
            );
          }
        }
      });
    },
  );
}

export async function fetchSpannerInstanceDatabasesRole(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new SpannerClient({ config }, logger);
  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_SPANNER_INSTANCE,
    },
    async (instanceEntity) => {
      const instanceId = (instanceEntity.name as string).split('/')[3];

      await client.iterateInstanceDatabases(instanceId, async (database) => {
        const databaseId = database.name?.split('/')[5];

        const client = new SpannerClient({ config }, logger);

        await client.iterateInstanceDatabasesRoles(
          instanceId,
          databaseId as string,
          async (role) => {
            // create entity
            await jobState.addEntity(createDatabaseRoleEntity(role));
          },
        );
      });
    },
  );
}

export async function buildSpannerInstanceDatabasesAssignedDatabaseRole(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE_ROLE,
    },
    async (databaseRole) => {
      const databaseKey = databaseRole._key.substring(
        0,
        databaseRole._key.indexOf('/databaseRoles'),
      );
      if (!jobState.hasKey(databaseKey)) {
        logger.warn(`Database Key Missing. Key: ${databaseKey}`);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.ASSIGNED,
            fromKey: databaseKey,
            fromType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
            toKey: databaseRole._key,
            toType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE_ROLE,
          }),
        );
      }
    },
  );
}

export async function fetchSpannerbackup(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new SpannerClient({ config }, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_SPANNER_INSTANCE },
    async (spannerInstance) => {
      const spannerName = spannerInstance.name as string;
      const instanceName =
        spannerName.split('/')[spannerName.split('/').length - 1];
      await client.iterateSpannerBackup(instanceName, async (spannerBackup) => {
        const spannerConfigEntity = createBackupEntity(spannerBackup);
        await jobState.addEntity(spannerConfigEntity);
      });
    },
  );
}

export async function fetchSpannerService(
  context: IntegrationStepContext,
): Promise<void> {
  const { instance, jobState } = context;

  const projectId = instance.config.projectId;
  const organizationId = instance.config.organizationId;
  const instanceId = instance.id;

  await jobState.addEntity(
    getCloudSpannerEntity({
      projectId,
      organizationId,
      instanceId,
    }),
  );
}

export async function buildSpannerInstanceBackupRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_SPANNER_BACKUP,
    },
    async (backupEntity) => {
      const instanceKey = backupEntity.name
        ?.toString()
        .substring(0, backupEntity.name?.toString().indexOf('/backups'));

      if (!jobState.hasKey(instanceKey)) {
        logger.warn(`Instance Key Missing: ${instanceKey}`);
      } else {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: instanceKey as string,
            fromType: ENTITY_TYPE_SPANNER_INSTANCE,
            toKey: backupEntity._key,
            toType: ENTITY_TYPE_SPANNER_BACKUP,
          }),
        );
      }
    },
  );
}

export async function buildProjectInstanceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  if (!jobState.hasKey(projectEntity._key)) {
    logger.warn(`
    Step Name: Build Project Has Spanner Instance Relationship
    Project Key: ${projectEntity._key}
    `);
  } else {
    await jobState.iterateEntities(
      { _type: ENTITY_TYPE_SPANNER_INSTANCE },
      async (spannerInstance) => {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: projectEntity._key as string,
            fromType: PROJECT_ENTITY_TYPE,
            toKey: spannerInstance._key as string,
            toType: ENTITY_TYPE_SPANNER_INSTANCE,
          }),
        );
      },
    );
  }
}

export async function buildProjectSpannerConfigurationRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  if (!jobState.hasKey(projectEntity._key)) {
    logger.warn(`
    Step Name: Build Project Has Spanner Instance Configuration Relationship
    Project Key: ${projectEntity._key}
    `);
  } else {
    await jobState.iterateEntities(
      { _type: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG },
      async (spannerInstanceConfig) => {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: projectEntity._key as string,
            fromType: PROJECT_ENTITY_TYPE,
            toKey: spannerInstanceConfig._key as string,
            toType: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
          }),
        );
      },
    );
  }
}

export async function buildProjectSpannerServiceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  const projectEntity = await getProjectEntity(jobState);

  if (!projectEntity) return;

  if (!jobState.hasKey(projectEntity._key)) {
    logger.warn(`
    Step Name: Build Project Has Spanner Service Relationship
    Project Key: ${projectEntity._key}
    `);
  } else {
    await jobState.iterateEntities(
      { _type: ENTITY_TYPE_SPANNER_SERVICE },
      async (spannerService) => {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: projectEntity._key as string,
            fromType: PROJECT_ENTITY_TYPE,
            toKey: spannerService._key as string,
            toType: ENTITY_TYPE_SPANNER_SERVICE,
          }),
        );
      },
    );
  }
}

export const spannerSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_SPANNER_INSTANCE_CONFIGS,
    ingestionSourceId: IngestionSources.SPANNER_INSTANCE_CONFIGS,
    name: 'Spanner Instance Configs',
    entities: [Entities.SPANNER_INSTANCE_CONFIGS],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchSpannerInstanceConfigs,
    permissions: SpannerPermissions.STEP_SPANNER_INSTANCE_CONFIGS,
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_SPANNER_INSTANCES,
    ingestionSourceId: IngestionSources.SPANNER_INSTANCES,
    name: 'Spanner Instances',
    entities: [Entities.SPANNER_INSTANCES],
    relationships: [Relationships.SPANNER_INSTANCE_USES_CONFIG],
    dependsOn: [STEP_SPANNER_INSTANCE_CONFIGS],
    executionHandler: fetchSpannerInstances,
    permissions: SpannerPermissions.STEP_SPANNER_INSTANCES,
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_SPANNER_INSTANCE_DATABASES,
    ingestionSourceId: IngestionSources.SPANNER_INSTANCE_DATABASES,
    name: 'Spanner Instance Databases',
    entities: [Entities.SPANNER_INSTANCE_DATABASES],
    relationships: [
      Relationships.SPANNER_INSTANCE_HAS_DATABASE,
      Relationships.SPANNER_INSTANCE_DATABASE_USES_KMS_KEY,
    ],
    dependsOn: [STEP_SPANNER_INSTANCES, STEP_CLOUD_KMS_KEYS],
    executionHandler: fetchSpannerInstanceDatabases,
    permissions: SpannerPermissions.STEP_SPANNER_INSTANCE_DATABASES,
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_SPANNER_INSTANCE_DATABASES_ROLE,
    ingestionSourceId: IngestionSources.SPANNER_INSTANCE_DATABASES_ROLE,
    name: 'Spanner Instance Databases Role',
    entities: [Entities.SPANNER_INSTANCE_DATABASES_ROLE],
    relationships: [],
    dependsOn: [STEP_SPANNER_INSTANCE_DATABASES],
    executionHandler: fetchSpannerInstanceDatabasesRole,
    permissions: SpannerPermissions.STEP_SPANNER_INSTANCE_DATABASES_ROLE,
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE,
    name: 'Build Spanner Instance Databases Assigned Database Role',
    entities: [],
    relationships: [
      Relationships.SPANNER_INSTANCE_DATABASES_ASSIGNED_DATABASE_ROLE,
    ],
    dependsOn: [
      STEP_SPANNER_INSTANCE_DATABASES_ROLE,
      STEP_SPANNER_INSTANCE_DATABASES,
    ],
    executionHandler: buildSpannerInstanceDatabasesAssignedDatabaseRole,
  },
  {
    id: STEP_SPANNER_BACKUP,
    ingestionSourceId: IngestionSources.SPANNER_BACKUP,
    name: 'Cloud Spanner Backups',
    entities: [Entities.SPANNER_BACKUP],
    relationships: [],
    dependsOn: [STEP_SPANNER_INSTANCES],
    executionHandler: fetchSpannerbackup,
    permissions: SpannerPermissions.STEP_SPANNER_INSTANCE_BACKUP,
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_CLOUD_SPANNER_SERVICE,
    ingestionSourceId: IngestionSources.SPANNER_SERVICE,
    name: 'Cloud Spanner Service',
    entities: [Entities.SPANNER_SERVICE],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchSpannerService,
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_SPANNER_INSTANCE_HAS_BACKUP,
    name: 'Build Spanner Instance has Backup',
    entities: [],
    relationships: [Relationships.SPANNER_INSTANCE_HAS_BACKUP],
    dependsOn: [STEP_SPANNER_BACKUP, STEP_SPANNER_INSTANCES],
    executionHandler: buildSpannerInstanceBackupRelationship,
  },

  {
    id: STEP_PROJECT_HAS_SPANNER_INSTANCE,
    name: 'Build Spanner Project Has Instance',
    entities: [],
    relationships: [Relationships.PROJECT_HAS_SPANNER_INSTANCE],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_SPANNER_INSTANCES],
    executionHandler: buildProjectInstanceRelationship,
  },
  {
    id: STEP_PROJECT_HAS_SPANNER_INSTANCE_CONFIG,
    name: 'Build Spanner Project Has Instance Config',
    entities: [],
    relationships: [Relationships.PROJECT_HAS_SPANNER_INSTANCE_CONFIG],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_SPANNER_INSTANCE_CONFIGS],
    executionHandler: buildProjectSpannerConfigurationRelationship,
  },
  {
    id: STEP_PROJECT_HAS_SPANNER_SERVICE,
    name: 'Build Spanner Project Has Spanner Service',
    entities: [],
    relationships: [Relationships.PROJECT_HAS_SPANNER_SERVICE],
    dependsOn: [STEP_RESOURCE_MANAGER_PROJECT, STEP_CLOUD_SPANNER_SERVICE],
    executionHandler: buildProjectSpannerServiceRelationship,
  },
];
