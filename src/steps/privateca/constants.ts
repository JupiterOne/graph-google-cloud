import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { StorageEntitiesSpec } from '../storage/constants';

export const PrivatecaSteps = {
  STEP_PRIVATE_CA_POOLS: {
    id: 'fetch-private-ca-pools',
    name: 'Private CA Pool',
  },
  STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES: {
    id: 'fetch-private-ca-certificate-authorities',
    name: 'Private CA Certificate Authorities',
  },
  STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET_RELATIONSHIPS: {
    id: 'build-private-ca-certificate-authority-bucket-relationships',
    name: 'Build Private CA Certificate Authoritity Bucket Relationships',
  },
  STEP_PRIVATE_CA_CERTIFICATES: {
    id: 'fetch-private-ca-certificates',
    name: 'Private CA Certificates',
  },
};

export const PrivatecaEntities = {
  PRIVATE_CA_POOL: {
    resourceName: 'Private CA Pool',
    _type: 'google_privateca_pool',
    _class: ['Group'],
  },
  PRIVATE_CA_CERTIFICATE_AUTHORITY: {
    resourceName: 'Private CA Certificate Authority',
    _type: 'google_privateca_certificate_authority',
    _class: ['Service'],
  },
  PRIVATE_CA_CERTIFICATE: {
    resourceName: 'Private CA Certificate',
    _type: 'google_privateca_certificate',
    _class: ['Certificate'],
  },
};

export const PrivatecaRelationships = {
  PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY: {
    _type: 'google_privateca_pool_has_certificate_authority',
    _class: RelationshipClass.HAS,
    sourceType: PrivatecaEntities.PRIVATE_CA_POOL._type,
    targetType: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type,
  },
  PRIVATE_CA_CERTIFICATE_AUTHORITY_BUCKET: {
    _type: 'google_privateca_certificate_authority_uses_storage_bucket',
    _class: RelationshipClass.USES,
    sourceType: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type,
    targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
  },
  PRIVATE_CA_CERTIFICATE_AUTHORITY_CERTIFICATE: {
    _type: 'google_privateca_certificate_authority_created_certificate',
    _class: RelationshipClass.CREATED,
    sourceType: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type,
    targetType: PrivatecaEntities.PRIVATE_CA_CERTIFICATE._type,
  },
};

export const IngestionSources = {
  PRIVATE_CA_POOLS: 'private-ca-pools',
  PRIVATE_CA_CERTIFICATES: 'private-ca-certificates',
  PRIVATE_CA_CERTIFICATE_AUTHORITIES: 'private-ca-certificate-authorities',
};

export const PrivatecaIngestionConfig = {
  [IngestionSources.PRIVATE_CA_POOLS]: {
    title: 'Google Private CA Pools',
    description: 'Certificate pools for private CAs.',
    defaultsToDisabled: false,
  },
  [IngestionSources.PRIVATE_CA_CERTIFICATES]: {
    title: 'Google Private CA Certificates',
    description: 'Certificates from private CAs.',
    defaultsToDisabled: false,
  },
  [IngestionSources.PRIVATE_CA_CERTIFICATE_AUTHORITIES]: {
    title: 'Google Private CA Authorities',
    description: 'Certificate authorities in private CAs.',
    defaultsToDisabled: false,
  },
};

export const PrivateCAPermissions = {
  STEP_PRIVATE_CA_POOLS: ['privateca.caPools.list'],
  STEP_PRIVATE_CA_CERTIFICATES: ['privateca.certificates.list'],
  STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES: [
    'privateca.certificateAuthorities.getIamPolicy',
    'privateca.certificateAuthorities.list',
  ],
};
