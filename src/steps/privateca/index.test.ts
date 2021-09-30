import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchAuthorityCertificates, fetchCertificateAuthorities } from '.';
import { fetchStorageBuckets } from '../storage';
import {
  ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
  ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
  RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_USES_STORAGE_BUCKET,
  RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_CREATED_CERTIFICATE,
} from './constants';

describe('#fetchCertificateAuthorities', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCertificateAuthorities',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchStorageBuckets(context);
    await fetchCertificateAuthorities(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_privateca_certificate_authority' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          public: { type: 'boolean' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          type: { type: 'string' },
          tier: { type: 'string' },
          lifetime: { type: 'string' },
          subject: { type: 'string' },
          'subject.countryCode': { type: 'string' },
          'subject.locality': { type: 'string' },
          'subject.organization': { type: 'string' },
          'subject.organizationalUnit': { type: 'string' },
          'subject.postalCode': { type: 'string' },
          'subject.province': { type: 'string' },
          'subject.streetAddress': { type: 'string' },
          'subjectAltName.dnsNames': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.emailAddresses': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.ipAddresses': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.uris': {
            type: 'array',
            items: { type: 'string' },
          },
          'keyUsage.certSign': { type: 'boolean' },
          'keyUsage.contentCommitment': { type: 'boolean' },
          'keyUsage.crlSign': { type: 'boolean' },
          'keyUsage.dataEncipherment': { type: 'boolean' },
          'keyUsage.decipherOnly': { type: 'boolean' },
          'keyUsage.digitalSignature': { type: 'boolean' },
          'keyUsage.encipherOnly': { type: 'boolean' },
          'keyUsage.keyAgreement': { type: 'boolean' },
          'keyUsage.keyEncipherment': { type: 'boolean' },
          'extendedKeyUsage.clientAuth': { type: 'boolean' },
          'extendedKeyUsage.codeSigning': { type: 'boolean' },
          'extendedKeyUsage.emailProtection': { type: 'boolean' },
          'extendedKeyUsage.ocspSigning': { type: 'boolean' },
          'extendedKeyUsage.serverAuth': { type: 'boolean' },
          'extendedKeyUsage.timeStamping': { type: 'boolean' },
          keyAlgorithm: { type: 'string' },
          caCertificateAccessUrl: { type: 'string' },
          crlAccessUrl: { type: 'string' },
          state: { type: 'string' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
          deletedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_USES_STORAGE_BUCKET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_privateca_certificate_authority_uses_storage_bucket',
          },
        },
      },
    });
  });
});

describe('#fetchAuthorityCertificates', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAuthorityCertificates',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchCertificateAuthorities(context);
    await fetchAuthorityCertificates(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_privateca_certificate_authority' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          public: { type: 'boolean' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          type: { type: 'string' },
          tier: { type: 'string' },
          lifetime: { type: 'string' },
          subject: { type: 'string' },
          'subject.countryCode': { type: 'string' },
          'subject.locality': { type: 'string' },
          'subject.organization': { type: 'string' },
          'subject.organizationalUnit': { type: 'string' },
          'subject.postalCode': { type: 'string' },
          'subject.province': { type: 'string' },
          'subject.streetAddress': { type: 'string' },
          'subjectAltName.dnsNames': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.emailAddresses': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.ipAddresses': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.uris': {
            type: 'array',
            items: { type: 'string' },
          },
          'keyUsage.certSign': { type: 'boolean' },
          'keyUsage.contentCommitment': { type: 'boolean' },
          'keyUsage.crlSign': { type: 'boolean' },
          'keyUsage.dataEncipherment': { type: 'boolean' },
          'keyUsage.decipherOnly': { type: 'boolean' },
          'keyUsage.digitalSignature': { type: 'boolean' },
          'keyUsage.encipherOnly': { type: 'boolean' },
          'keyUsage.keyAgreement': { type: 'boolean' },
          'keyUsage.keyEncipherment': { type: 'boolean' },
          'extendedKeyUsage.clientAuth': { type: 'boolean' },
          'extendedKeyUsage.codeSigning': { type: 'boolean' },
          'extendedKeyUsage.emailProtection': { type: 'boolean' },
          'extendedKeyUsage.ocspSigning': { type: 'boolean' },
          'extendedKeyUsage.serverAuth': { type: 'boolean' },
          'extendedKeyUsage.timeStamping': { type: 'boolean' },
          keyAlgorithm: { type: 'string' },
          caCertificateAccessUrl: { type: 'string' },
          crlAccessUrl: { type: 'string' },
          state: { type: 'string' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
          deletedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Certificate'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_privateca_certificate' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          issuer: { type: 'string' },
          alternativeNames: {
            type: 'array',
            items: { type: 'string' },
          },
          subject: { type: 'string' },
          hexSerial: { type: 'string' },
          lifetime: { type: 'string' },
          keyAlgorithm: { type: 'string' },
          publicKeyType: { type: 'string' },
          notBeforeTime: { type: 'number' },
          notAfterTime: { type: 'number' },
          'subject.countryCode': { type: 'string' },
          'subject.locality': { type: 'string' },
          'subject.organization': { type: 'string' },
          'subject.organizationalUnit': { type: 'string' },
          'subject.postalCode': { type: 'string' },
          'subject.province': { type: 'string' },
          'subject.streetAddress': { type: 'string' },
          'subjectAltName.dnsNames': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.emailAddresses': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.ipAddresses': {
            type: 'array',
            items: { type: 'string' },
          },
          'subjectAltName.uris': {
            type: 'array',
            items: { type: 'string' },
          },
          'keyUsage.certSign': { type: 'boolean' },
          'keyUsage.contentCommitment': { type: 'boolean' },
          'keyUsage.crlSign': { type: 'boolean' },
          'keyUsage.dataEncipherment': { type: 'boolean' },
          'keyUsage.decipherOnly': { type: 'boolean' },
          'keyUsage.digitalSignature': { type: 'boolean' },
          'keyUsage.encipherOnly': { type: 'boolean' },
          'keyUsage.keyAgreement': { type: 'boolean' },
          'keyUsage.keyEncipherment': { type: 'boolean' },
          'extendedKeyUsage.clientAuth': { type: 'boolean' },
          'extendedKeyUsage.codeSigning': { type: 'boolean' },
          'extendedKeyUsage.emailProtection': { type: 'boolean' },
          'extendedKeyUsage.ocspSigning': { type: 'boolean' },
          'extendedKeyUsage.serverAuth': { type: 'boolean' },
          'extendedKeyUsage.timeStamping': { type: 'boolean' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY_CREATED_CERTIFICATE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'CREATED' },
          _type: {
            const: 'google_privateca_certificate_authority_created_certificate',
          },
        },
      },
    });
  });
});
