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
  STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
  RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY,
  ENTITY_TYPE_COMPUTE_IMAGE,
  STEP_COMPUTE_IMAGES,
} from '../constants';
import { compute_v1 } from 'googleapis';
import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../../kms';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../../utils/kms';

export async function buildImageUsesKmsRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_IMAGE },
    async (imageEntity) => {
      const instance = getRawData<compute_v1.Schema$Image>(imageEntity);
      if (!instance) {
        logger.warn(
          {
            _key: imageEntity._key,
          },
          'Could not find raw data on image instance entity',
        );
        return;
      }

      const kmsKeyName = instance.imageEncryptionKey?.kmsKeyName;
      if (!kmsKeyName) {
        return;
      }

      const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName);
      const kmsKeyEntity = await jobState.findEntity(kmsKey);

      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: imageEntity,
            to: kmsKeyEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.USES,
            _type: RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: imageEntity._key,
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

export const buildImageUsesKmsRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
    name: 'Build Compute Image KMS Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY,
        sourceType: ENTITY_TYPE_COMPUTE_IMAGE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_COMPUTE_IMAGES, STEP_CLOUD_KMS_KEYS],
    executionHandler: buildImageUsesKmsRelationships,
  };
