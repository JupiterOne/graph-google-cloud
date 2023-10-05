import {
  RelationshipClass,
  createDirectRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { PrivateCaClient } from '../client';
import {
  PrivatecaEntities,
  PrivatecaRelationships,
  PrivatecaSteps,
} from '../constants';
import { createCertificateEntity } from '../converters';
import { privateca_v1 } from 'googleapis';
import { getCloudStorageBucketKey } from '../../storage/converters';
import { StorageStepsSpec } from '../../storage/constants';

async function fetchAuthorityCertificates(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new PrivateCaClient({ config }, logger);

  await jobState.iterateEntities(
    {
      _type: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type,
    },
    async (certificateAuthorityEntity) => {
      const caPoolId = (certificateAuthorityEntity.name as string).split(
        '/',
      )[5];
      const caLocation = (certificateAuthorityEntity.name as string).split(
        '/',
      )[3];

      await client.iterateAuthorityCertificates(
        caPoolId,
        caLocation,
        async (certificate) => {
          const certificateEntity = createCertificateEntity({
            data: certificate,
            keyAlgorithm: certificateAuthorityEntity.keyAlgorithm as string,
            projectId: client.projectId,
          });

          await jobState.addEntity(certificateEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.CREATED,
              from: certificateAuthorityEntity,
              to: certificateEntity,
            }),
          );
        },
      );
    },
  );
}

async function buildCertificateAuthorityBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type },
    async (caAuthorityEntity) => {
      const caAuthority =
        getRawData<privateca_v1.Schema$CertificateAuthority>(caAuthorityEntity);
      if (!caAuthority) {
        logger.warn(
          {
            _key: caAuthorityEntity._key,
          },
          'Could not find raw data on certificate authority entity',
        );
        return;
      }

      const bucketName = caAuthority.gcsBucket;

      if (!bucketName) {
        return;
      }

      const storageBucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(bucketName),
      );
      if (!storageBucketEntity) {
        logger.warn(
          `${PrivatecaSteps.STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS.id} - Missing storageBucketEntity.`,
        );
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

export const fetchAuthorityCertificatesStepMap: GoogleCloudIntegrationStep = {
  id: PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATES.id,
  name: PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATES.name,
  entities: [PrivatecaEntities.PRIVATE_CA_CERTIFICATE],
  relationships: [
    PrivatecaRelationships.PRIVATE_CA_CERTIFICATE_AUTHORITY_CERTIFICATE,
  ],
  dependsOn: [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id],
  executionHandler: fetchAuthorityCertificates,
  permissions: ['privateca.certificates.list'],
  apis: ['privateca.googleapis.com'],
};

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
