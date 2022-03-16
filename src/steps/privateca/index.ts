import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { privateca_v1beta1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { isMemberPublic } from '../../utils/iam';
import { PrivateCaClient } from './client';
import {
  STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
  STEP_PRIVATE_CA_CERTIFICATES,
  ENTITY_CLASS_PRIVATE_CA_CERTIFICATE_AUTHORITY,
  ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
  ENTITY_CLASS_PRIVATE_CA_CERTIFICATE,
  ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
  RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_CREATED_CERTIFICATE,
  RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_USES_STORAGE_BUCKET,
  STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS,
} from './constants';
import {
  createCertificateAuthorityEntity,
  createCertificateEntity,
} from './converters';
import { getCloudStorageBucketKey } from '../storage/converters';
import { STEP_CLOUD_STORAGE_BUCKETS } from '../storage';
import { CLOUD_STORAGE_BUCKET_ENTITY_TYPE } from '../storage/constants';

function isCertificateAuthorityPolicyPublicAccess(
  caPolicy: privateca_v1beta1.Schema$Policy,
): boolean {
  for (const binding of caPolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchCertificateAuthorities(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new PrivateCaClient({ config });

  await client.iterateCertificateAuthorities(async (certificateAuthority) => {
    const authorityId = certificateAuthority.name?.split('/')[5];
    const location = certificateAuthority.name?.split('/')[3];

    const policy = await client.getAuthorityPolicy(
      authorityId as string,
      location as string,
    );

    const caEntity = createCertificateAuthorityEntity({
      data: certificateAuthority,
      projectId: client.projectId,
      isPublic: isCertificateAuthorityPolicyPublicAccess(policy),
    });
    await jobState.addEntity(caEntity);
  });
}

export async function buildCertificateAuthorityBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY },
    async (caAuthorityEntity) => {
      const instance =
        getRawData<privateca_v1beta1.Schema$CertificateAuthority>(
          caAuthorityEntity,
        );
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

export async function fetchAuthorityCertificates(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new PrivateCaClient({ config });

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
    },
    async (certificateAuthorityEntity) => {
      const caId = (certificateAuthorityEntity.name as string).split('/')[5];
      const caLocation = (certificateAuthorityEntity.name as string).split(
        '/',
      )[3];

      await client.iterateAuthorityCertificates(
        caId,
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

export const privateCaSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
    name: 'Private CA Certificate Authorities',
    entities: [
      {
        resourceName: 'Private CA Certificate Authority',
        _type: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
        _class: ENTITY_CLASS_PRIVATE_CA_CERTIFICATE_AUTHORITY,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCertificateAuthorities,
  },
  {
    id: STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS,
    name: 'Build Private CA Certificate Authoritity Bucket Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type:
          RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_USES_STORAGE_BUCKET,
        sourceType: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
        targetType: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      },
    ],
    dependsOn: [
      STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
      STEP_CLOUD_STORAGE_BUCKETS,
    ],
    executionHandler: buildCertificateAuthorityBucketRelationships,
  },
  {
    id: STEP_PRIVATE_CA_CERTIFICATES,
    name: 'Private CA Certificates',
    entities: [
      {
        resourceName: 'Private CA Certificate',
        _type: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
        _class: ENTITY_CLASS_PRIVATE_CA_CERTIFICATE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.CREATED,
        _type:
          RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_CREATED_CERTIFICATE,
        sourceType: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
        targetType: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
      },
    ],
    dependsOn: [STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES],
    executionHandler: fetchAuthorityCertificates,
  },
];
