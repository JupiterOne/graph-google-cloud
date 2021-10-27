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
import { STEP_RESOURCE_MANAGER_PROJECT } from '../resource-manager';
import { SQLAdminClient } from './client';
import {
  STEP_SQL_ADMIN_INSTANCES,
  SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP_TYPE,
  SQL_ADMIN_INSTANCE_ENTITY_CLASS,
  SQL_ADMIN_INSTANCE_ENTITY_TYPE,
} from './constants';
import { createSQLInstanceEntity } from './converters';

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

    const instanceEntity = createSQLInstanceEntity(instance);
    if (!instanceEntity) {
      logger.warn(
        {
          selfLink: instance.selfLink,
        },
        'Skipping cloud SQL instance resource where instance.databaseVersion is undefined',
      );
      return;
    }

    await jobState.addEntity(instanceEntity);
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
            _type: SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP_TYPE,
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
        resourceName: 'SQL Admin Instance',
        _type: SQL_ADMIN_INSTANCE_ENTITY_CLASS,
        _class: SQL_ADMIN_INSTANCE_ENTITY_TYPE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: SQL_INSTANCE_USES_KMS_KEY_RELATIONSHIP_TYPE,
        sourceType: SQL_ADMIN_INSTANCE_ENTITY_CLASS,
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
