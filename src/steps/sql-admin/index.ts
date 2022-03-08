import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  IntegrationStep,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../utils/kms';
import {
  ENTITY_TYPE_KMS_KEY,
  STEP_CLOUD_KMS_KEYS,
  STEP_CLOUD_KMS_KEY_RINGS,
} from '../kms';
import { STEP_RESOURCE_MANAGER_PROJECT } from '../resource-manager/constants';
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
  SQL_POSTGRES_INSTANCE_USES_KMS_KEY_RELATIONSHIP,
  SQL_MYSQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP,
  SQL_SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP,
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
        {
          selfLink: instance.selfLink,
        },
        'Skipping cloud SQL instance resource where instance.databaseVersion is undefined',
      );
      return;
    }

    let instanceEntity: Entity;
    let relationshipType: string;

    if (instance.databaseVersion?.toUpperCase().includes(DATABASE_TYPE.MYSQL)) {
      instanceEntity = await jobState.addEntity(
        createMySQLInstanceEntity(instance),
      );
      relationshipType = SQL_MYSQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP;
    } else if (
      instance.databaseVersion?.toUpperCase().includes(DATABASE_TYPE.POSTGRES)
    ) {
      instanceEntity = await jobState.addEntity(
        createPostgresInstanceEntity(instance),
      );
      relationshipType = SQL_POSTGRES_INSTANCE_USES_KMS_KEY_RELATIONSHIP;
    } else if (
      instance.databaseVersion?.toUpperCase().includes(DATABASE_TYPE.SQL_SERVER)
    ) {
      instanceEntity = await jobState.addEntity(
        createSQLServerInstanceEntity(instance),
      );
      relationshipType = SQL_SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP;
    } else {
      // NOTE: This could happen if Google Cloud introduces a new type of
      // database under the SQL Admin offering. This log is intentially a `warn`,
      // for greater visibility that we should support this new type.
      logger.warn(
        {
          selfLink: instance.selfLink,
        },
        'Skipping cloud SQL instance resource where instance.databaseVersion is undefined',
      );
      return;
    }

    const kmsKeyName = instance.diskEncryptionConfiguration?.kmsKeyName;

    if (kmsKeyName) {
      const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName);
      const kmsKeyEntity = await jobState.findEntity(kmsKey);

      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: instanceEntity,
            to: kmsKeyEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.USES,
            _type: relationshipType,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: instanceEntity._key,
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
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: SQL_POSTGRES_INSTANCE_USES_KMS_KEY_RELATIONSHIP,
        sourceType: SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
      {
        _class: RelationshipClass.USES,
        _type: SQL_MYSQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP,
        sourceType: SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
      {
        _class: RelationshipClass.USES,
        _type: SQL_SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP,
        sourceType: SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [
      STEP_RESOURCE_MANAGER_PROJECT,
      STEP_CLOUD_KMS_KEY_RINGS,
      STEP_CLOUD_KMS_KEYS,
    ],
    executionHandler: fetchSQLAdminInstances,
  },
];
