import {
  RelationshipClass,
  RelationshipDirection,
  createDirectRelationship,
  createMappedRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
  RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY,
  ENTITY_TYPE_COMPUTE_DISK,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_REGION_DISKS,
} from '../constants';
import {
  ENTITY_TYPE_KMS_KEY,
  STEP_CLOUD_KMS_KEYS,
  STEP_CLOUD_KMS_KEY_RINGS,
} from '../../kms';
import { compute_v1 } from 'googleapis';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../../utils/kms';

// Note: this builds relationships for both disk and region disk
export async function buildDiskUsesKmsRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_DISK },
    async (diskEntity) => {
      const instance = getRawData<compute_v1.Schema$Disk>(diskEntity);
      if (!instance) {
        logger.warn(
          {
            _key: diskEntity._key,
          },
          'Could not find raw data on disk instance entity',
        );
        return;
      }

      const kmsKeyName = instance.diskEncryptionKey?.kmsKeyName;
      if (!kmsKeyName) {
        return;
      }

      const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName);
      const kmsKeyEntity = await jobState.findEntity(kmsKey);

      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: diskEntity,
            to: kmsKeyEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.USES,
            _type: RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: diskEntity._key,
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
    },
  );
}

export const buildDiskUsesKmsRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
    name: 'Compute Disk KMS Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY,
        sourceType: ENTITY_TYPE_COMPUTE_DISK,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    executionHandler: buildDiskUsesKmsRelationships,
    dependsOn: [
      STEP_COMPUTE_DISKS,
      STEP_COMPUTE_REGION_DISKS,
      STEP_CLOUD_KMS_KEYS,
      STEP_CLOUD_KMS_KEY_RINGS,
    ],
  };
