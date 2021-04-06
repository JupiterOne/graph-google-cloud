import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { privateca_v1beta1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_PRIVATE_CA_CERTIFICATE_AUTHORITY,
  ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
  ENTITY_CLASS_PRIVATE_CA_CERTIFICATE,
  ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
} from './constants';

export function createCertificateAuthorityEntity({
  data,
  projectId,
  isPublic,
}: {
  data: privateca_v1beta1.Schema$CertificateAuthority;
  projectId: string;
  isPublic: boolean;
}) {
  const location = data.name?.split('/')[3];
  const authorityId = data.name?.split('/')[5];

  delete data.pemCaCertificates;
  for (const certificateDescription of data.caCertificateDescriptions || []) {
    delete certificateDescription.publicKey?.key;
  }

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE_AUTHORITY,
        _class: ENTITY_CLASS_PRIVATE_CA_CERTIFICATE_AUTHORITY,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        public: isPublic,
        category: ['security'],
        type: data.type,
        tier: data.tier,
        lifetime: data.lifetime,
        subject: data.config?.subjectConfig?.commonName,
        'subject.countryCode': data.config?.subjectConfig?.subject?.countryCode,
        'subject.locality': data.config?.subjectConfig?.subject?.locality,
        'subject.organization':
          data.config?.subjectConfig?.subject?.organization,
        'subject.organizationalUnit':
          data.config?.subjectConfig?.subject?.organizationalUnit,
        'subject.postalCode': data.config?.subjectConfig?.subject?.postalCode,
        'subject.province': data.config?.subjectConfig?.subject?.province,
        'subject.streetAddress':
          data.config?.subjectConfig?.subject?.streetAddress,
        'subjectAltName.dnsNames':
          data.config?.subjectConfig?.subjectAltName?.dnsNames,
        'subjectAltName.emailAddresses':
          data.config?.subjectConfig?.subjectAltName?.emailAddresses,
        'subjectAltName.ipAddresses':
          data.config?.subjectConfig?.subjectAltName?.ipAddresses,
        'subjectAltName.uris': data.config?.subjectConfig?.subjectAltName?.uris,
        'keyUsage.certSign':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.certSign,
        'keyUsage.contentCommitment':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.contentCommitment,
        'keyUsage.crlSign':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.crlSign,
        'keyUsage.dataEncipherment':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.dataEncipherment,
        'keyUsage.decipherOnly':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.decipherOnly,
        'keyUsage.digitalSignature':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.digitalSignature,
        'keyUsage.encipherOnly':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.encipherOnly,
        'keyUsage.keyAgreement':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.keyAgreement,
        'keyUsage.keyEncipherment':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.keyEncipherment,
        'extendedKeyUsage.clientAuth':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.clientAuth,
        'extendedKeyUsage.codeSigning':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.codeSigning,
        'extendedKeyUsage.emailProtection':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.emailProtection,
        'extendedKeyUsage.ocspSigning':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.ocspSigning,
        'extendedKeyUsage.serverAuth':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.serverAuth,
        'extendedKeyUsage.timeStamping':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.timeStamping,
        keyAlgorithm: data.keySpec?.algorithm,
        caCertificateAccessUrl: data.accessUrls?.caCertificateAccessUrl,
        crlAccessUrl: data.accessUrls?.crlAccessUrl,
        state: data.state,
        webLink: getGoogleCloudConsoleWebLink(
          `/security/cas/manage/locations/${location}/certificateAuthorities/${authorityId}/details?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
        deletedOn: parseTimePropertyValue(data.deleteTime),
      },
    },
  });
}

export function createCertificateEntity({
  data,
  keyAlgorithm,
  projectId,
}: {
  data: privateca_v1beta1.Schema$Certificate;
  keyAlgorithm: string;
  projectId: string;
}) {
  const location = data.name?.split('/')[3];
  const authorityId = data.name?.split('/')[5];
  const ceritificateId = data.name?.split('/')[7];

  delete data.config?.publicKey;
  delete data.pemCertificate;
  delete data.certificateDescription?.publicKey?.key;
  delete data.pemCertificateChain;

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _type: ENTITY_TYPE_PRIVATE_CA_CERTIFICATE,
        _class: ENTITY_CLASS_PRIVATE_CA_CERTIFICATE,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        issuer: data.name?.split('/')[5],
        alternativeNames:
          data.certificateDescription?.subjectDescription?.subjectAltName
            ?.dnsNames,
        subject: data.certificateDescription?.subjectDescription?.commonName,
        hexSerial:
          data.certificateDescription?.subjectDescription?.hexSerialNumber,
        lifetime: data.certificateDescription?.subjectDescription?.lifetime,
        keyAlgorithm: keyAlgorithm,
        publicKeyType: data.certificateDescription?.publicKey?.type,
        notBeforeTime: parseTimePropertyValue(
          data.certificateDescription?.subjectDescription?.notBeforeTime,
        ),
        notAfterTime: parseTimePropertyValue(
          data.certificateDescription?.subjectDescription?.notAfterTime,
        ),
        'subject.countryCode':
          data.certificateDescription?.subjectDescription?.subject?.countryCode,
        'subject.locality':
          data.certificateDescription?.subjectDescription?.subject?.locality,
        'subject.organization':
          data.certificateDescription?.subjectDescription?.subject
            ?.organization,
        'subject.organizationalUnit':
          data.certificateDescription?.subjectDescription?.subject
            ?.organizationalUnit,
        'subject.postalCode':
          data.certificateDescription?.subjectDescription?.subject?.postalCode,
        'subject.province':
          data.certificateDescription?.subjectDescription?.subject?.province,
        'subject.streetAddress':
          data.certificateDescription?.subjectDescription?.subject
            ?.streetAddress,
        'subjectAltName.dnsNames':
          data.certificateDescription?.subjectDescription?.subjectAltName
            ?.dnsNames,
        'subjectAltName.emailAddresses':
          data.certificateDescription?.subjectDescription?.subjectAltName
            ?.emailAddresses,
        'subjectAltName.ipAddresses':
          data.certificateDescription?.subjectDescription?.subjectAltName
            ?.ipAddresses,
        'subjectAltName.uris':
          data.certificateDescription?.subjectDescription?.subjectAltName?.uris,
        'keyUsage.certSign':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.certSign,
        'keyUsage.contentCommitment':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.contentCommitment,
        'keyUsage.crlSign':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.crlSign,
        'keyUsage.dataEncipherment':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.dataEncipherment,
        'keyUsage.decipherOnly':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.decipherOnly,
        'keyUsage.digitalSignature':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.digitalSignature,
        'keyUsage.encipherOnly':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.encipherOnly,
        'keyUsage.keyAgreement':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.keyAgreement,
        'keyUsage.keyEncipherment':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.baseKeyUsage?.keyEncipherment,
        'extendedKeyUsage.clientAuth':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.clientAuth,
        'extendedKeyUsage.codeSigning':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.codeSigning,
        'extendedKeyUsage.emailProtection':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.emailProtection,
        'extendedKeyUsage.ocspSigning':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.ocspSigning,
        'extendedKeyUsage.serverAuth':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.serverAuth,
        'extendedKeyUsage.timeStamping':
          data.config?.reusableConfig?.reusableConfigValues?.keyUsage
            ?.extendedKeyUsage?.timeStamping,
        webLink: getGoogleCloudConsoleWebLink(
          `/security/cas/certificate/locations/${location}/certificateAuthorities/${authorityId}/certificates/${ceritificateId}?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}
