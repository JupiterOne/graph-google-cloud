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
  ENTITY_CLASS_SPANNER_INSTANCE,
  ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
  ENTITY_CLASS_SPANNER_INSTANCE_DATABASE,
  ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
  ENTITY_CLASS_SPANNER_INSTANCE_CONFIG,
  RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_DATABASE,
  RELATIONSHIP_TYPE_SPANNER_INSTANCE_USES_CONFIG,
  RELATIONSHIP_TYPE_SPANNER_INSTANCE_DATABASE_USES_KMS_KEY,
} from './constants';
import {
  createSpannerInstanceConfiguration,
  createSpannerInstanceDatabaseEntity,
  createSpannerInstanceEntity,
} from './converters';

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

export const spannerSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_SPANNER_INSTANCE_CONFIGS,
    name: 'Spanner Instance Configs',
    entities: [
      {
        resourceName: 'Spanner Instance Config',
        _type: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
        _class: ENTITY_CLASS_SPANNER_INSTANCE_CONFIG,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchSpannerInstanceConfigs,
    permissions: ['spanner.instanceConfigs.list'],
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_SPANNER_INSTANCES,
    name: 'Spanner Instances',
    entities: [
      {
        resourceName: 'Spanner Instance',
        _type: ENTITY_TYPE_SPANNER_INSTANCE,
        _class: ENTITY_CLASS_SPANNER_INSTANCE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_USES_CONFIG,
        sourceType: ENTITY_TYPE_SPANNER_INSTANCE,
        targetType: ENTITY_TYPE_SPANNER_INSTANCE_CONFIG,
      },
    ],
    dependsOn: [STEP_SPANNER_INSTANCE_CONFIGS],
    executionHandler: fetchSpannerInstances,
    permissions: ['spanner.instances.list', 'spanner.databases.getIamPolicy'],
    apis: ['spanner.googleapis.com'],
  },
  {
    id: STEP_SPANNER_INSTANCE_DATABASES,
    name: 'Spanner Instance Databases',
    entities: [
      {
        resourceName: 'Spanner Instance Database',
        _type: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
        _class: ENTITY_CLASS_SPANNER_INSTANCE_DATABASE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_HAS_DATABASE,
        sourceType: ENTITY_TYPE_SPANNER_INSTANCE,
        targetType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
      },
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_SPANNER_INSTANCE_DATABASE_USES_KMS_KEY,
        sourceType: ENTITY_TYPE_SPANNER_INSTANCE_DATABASE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_SPANNER_INSTANCES, STEP_CLOUD_KMS_KEYS],
    executionHandler: fetchSpannerInstanceDatabases,
    permissions: ['spanner.databases.list'],
    apis: ['spanner.googleapis.com'],
  },
];
