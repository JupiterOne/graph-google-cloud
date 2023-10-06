import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { CloudKmsClient } from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  ENTITY_CLASS_KMS_KEY,
  ENTITY_CLASS_KMS_KEY_RING,
  ENTITY_TYPE_KMS_KEY,
  ENTITY_TYPE_KMS_KEY_RING,
  RELATIONSHIP_TYPE_KMS_KEY_RING_HAS_KMS_KEY,
  STEP_CLOUD_KMS_KEYS,
  STEP_CLOUD_KMS_KEY_RINGS,
} from './constants';
import { createKmsKeyRingEntity, createKmsCryptoKeyEntity } from './converters';

export * from './constants';

export async function fetchKmsKeyRings(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new CloudKmsClient({ config: instance.config }, logger);

  await client.iterateKeyRings(
    async (keyRing) => {
      await jobState.addEntity(createKmsKeyRingEntity(keyRing));
    },
    ({
      totalRequestsMade,
      totalResourcesReturned,
      maximumResourcesPerPage,
    }) => {
      logger.info(
        {
          totalRequestsMade,
          totalResourcesReturned,
          maximumResourcesPerPage,
        },
        'KMS Key Rings API Requests summary',
      );
    },
  );
}

export async function fetchKmsCryptoKeys(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new CloudKmsClient({ config: instance.config }, logger);

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_KMS_KEY_RING,
    },
    async (keyRingEntity) => {
      const location = keyRingEntity.location as string;
      const cryptoKeyRingShortName = keyRingEntity.shortName as string;

      await client.iterateCryptoKeys(
        {
          cryptoKeyRingShortName,
          location,
        },
        async (cryptoKey) => {
          // Get cryptoKey's IAM policy
          const iamPolicy = await client.fetchCryptoKeyPolicy(
            cryptoKey.name as string,
          );

          const cryptoKeyEntity = await jobState.addEntity(
            createKmsCryptoKeyEntity({
              cryptoKey,
              location,
              projectId: client.projectId,
              cryptoKeyRingShortName,
              iamPolicy,
            }),
          );

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: keyRingEntity,
              to: cryptoKeyEntity,
            }),
          );
        },
      );
    },
  );
}

export const kmsSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_CLOUD_KMS_KEY_RINGS,
    name: 'KMS Key Rings',
    entities: [
      {
        resourceName: 'KMS Key Ring',
        _type: ENTITY_TYPE_KMS_KEY_RING,
        _class: ENTITY_CLASS_KMS_KEY_RING,
      },
    ],
    relationships: [],
    executionHandler: fetchKmsKeyRings,
    permissions: ['cloudkms.keyRings.list'],
    apis: ['cloudkms.googleapis.com'],
  },
  {
    id: STEP_CLOUD_KMS_KEYS,
    name: 'KMS Crypto Keys',
    entities: [
      {
        resourceName: 'KMS Crypto Key',
        _type: ENTITY_TYPE_KMS_KEY,
        _class: ENTITY_CLASS_KMS_KEY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_KMS_KEY_RING_HAS_KMS_KEY,
        sourceType: ENTITY_TYPE_KMS_KEY_RING,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    executionHandler: fetchKmsCryptoKeys,
    dependsOn: [STEP_CLOUD_KMS_KEY_RINGS],
    permissions: [
      'cloudkms.cryptoKeys.list',
      'cloudkms.cryptoKeys.getIamPolicy',
    ],
    apis: ['cloudkms.googleapis.com'],
  },
];
