import {
  RelationshipClass,
  createDirectRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import {
  PrivatecaEntities,
  PrivatecaRelationships,
  PrivatecaSteps,
} from '../constants';
import { privateca_v1 } from 'googleapis';
import { getCloudStorageBucketKey } from '../../storage/converters';
import { StorageStepsSpec } from '../../storage/constants';

async function buildCertificateAuthorityBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type },
    async (caAuthorityEntity) => {
      const instance =
        getRawData<privateca_v1.Schema$CertificateAuthority>(caAuthorityEntity);
      if (!instance) {
        logger.warn(
          {
            _key: caAuthorityEntity._key,
          },
          'Could not find raw data on certificate authority entity',
        );
        return;
      }

      const bucketName = instance.gcsBucket;

      if (!bucketName) {
        return;
      }

      const storageBucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(bucketName),
      );
      if (!storageBucketEntity) {
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          from: caAuthorityEntity,
          to: storageBucketEntity,
        }),
      );
    },
  );
}

export const buildCertificateAuthorityBucketRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS.id,
    name: PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS.name,
    entities: [],
    relationships: [
      PrivatecaRelationships.PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET,
    ],
    dependsOn: [
      PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id,
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    ],
    executionHandler: buildCertificateAuthorityBucketRelationships,
  };
