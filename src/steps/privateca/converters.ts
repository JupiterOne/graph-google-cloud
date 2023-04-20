import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { privateca_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import { PrivatecaEntities } from './constants';

export function createCertificateAuthorityEntity({
  data,
  projectId,
  isPublic,
}: {
  data: privateca_v1.Schema$CertificateAuthority;
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
        _type: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type,
        _class: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._class,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        function: ['certificate-management'],
        public: isPublic,
        category: ['security'],
        type: data.type,
        tier: data.tier,
        lifetime: data.lifetime,
        subject: data.config?.subjectConfig?.subject?.commonName,
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
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.certSign,
        'keyUsage.contentCommitment':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.contentCommitment,
        'keyUsage.crlSign':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.crlSign,
        'keyUsage.dataEncipherment':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.dataEncipherment,
        'keyUsage.decipherOnly':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.decipherOnly,
        'keyUsage.digitalSignature':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.digitalSignature,
        'keyUsage.encipherOnly':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.encipherOnly,
        'keyUsage.keyAgreement':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.keyAgreement,
        'keyUsage.keyEncipherment':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.keyEncipherment,
        'extendedKeyUsage.clientAuth':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.clientAuth,
        'extendedKeyUsage.codeSigning':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.codeSigning,
        'extendedKeyUsage.emailProtection':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.emailProtection,
        'extendedKeyUsage.ocspSigning':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.ocspSigning,
        'extendedKeyUsage.serverAuth':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.serverAuth,
        'extendedKeyUsage.timeStamping':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.timeStamping,
        keyAlgorithm: data.keySpec?.algorithm,
        caCertificateAccessUrl: data.accessUrls?.caCertificateAccessUrl,
        crlAccessUrl: data.accessUrls?.crlAccessUrls,
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
  data: privateca_v1.Schema$Certificate;
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
        _type: PrivatecaEntities.PRIVATE_CA_CERTIFICATE._type,
        _class: PrivatecaEntities.PRIVATE_CA_CERTIFICATE._class,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        issuer: data.name?.split('/')[5],
        issuerCertificateAuthority: data.issuerCertificateAuthority,
        alternativeNames:
          data.certificateDescription?.subjectDescription?.subjectAltName
            ?.dnsNames,
        subject:
          data.certificateDescription?.subjectDescription?.subject?.commonName,
        hexSerial:
          data.certificateDescription?.subjectDescription?.hexSerialNumber,
        lifetime: data.certificateDescription?.subjectDescription?.lifetime,
        keyAlgorithm: keyAlgorithm,
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
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.certSign,
        'keyUsage.contentCommitment':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.contentCommitment,
        'keyUsage.crlSign':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.crlSign,
        'keyUsage.dataEncipherment':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.dataEncipherment,
        'keyUsage.decipherOnly':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.decipherOnly,
        'keyUsage.digitalSignature':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.digitalSignature,
        'keyUsage.encipherOnly':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.encipherOnly,
        'keyUsage.keyAgreement':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.keyAgreement,
        'keyUsage.keyEncipherment':
          data.config?.x509Config?.keyUsage?.baseKeyUsage?.keyEncipherment,
        'extendedKeyUsage.clientAuth':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.clientAuth,
        'extendedKeyUsage.codeSigning':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.codeSigning,
        'extendedKeyUsage.emailProtection':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.emailProtection,
        'extendedKeyUsage.ocspSigning':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.ocspSigning,
        'extendedKeyUsage.serverAuth':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.serverAuth,
        'extendedKeyUsage.timeStamping':
          data.config?.x509Config?.keyUsage?.extendedKeyUsage?.timeStamping,
        webLink: getGoogleCloudConsoleWebLink(
          `/security/cas/certificate/locations/${location}/certificateAuthorities/${authorityId}/certificates/${ceritificateId}?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export const createCaPoolEntity = (caPool: privateca_v1.Schema$CaPool) => {
  return createGoogleCloudIntegrationEntity(caPool, {
    entityData: {
      source: caPool,
      assign: {
        _class: PrivatecaEntities.PRIVATE_CA_POOL._class,
        _type: PrivatecaEntities.PRIVATE_CA_POOL._type,
        _key: caPool.name as string,
        'issuancePolicy.allowedIssuanceModes.allowConfigBasedIssuance':
          caPool.issuancePolicy?.allowedIssuanceModes?.allowConfigBasedIssuance,
        'issuancePolicy.allowedIssuanceModes.allowCsrBasedIssuance':
          caPool.issuancePolicy?.allowedIssuanceModes?.allowCsrBasedIssuance,
        'issuancePolicy.allowedKeyTypes':
          caPool.issuancePolicy?.allowedKeyTypes?.map((allowedKeyType) =>
            JSON.stringify(allowedKeyType),
          ),
        'issuancePolicy.baselineValues.additionalExtensions':
          caPool.issuancePolicy?.baselineValues?.additionalExtensions?.map(
            (additionalExtension) => JSON.stringify(additionalExtension),
          ),
        'issuancePolicy.baselineValues.aiaOcspServers':
          caPool.issuancePolicy?.baselineValues?.aiaOcspServers,
        'issuancePolicy.baselineValues.caOptions.isCa':
          caPool.issuancePolicy?.baselineValues?.caOptions?.isCa,
        'issuancePolicy.maximumLifetime':
          caPool.issuancePolicy?.maximumLifetime,
        'publishingOptions.publishCaCert':
          caPool.publishingOptions?.publishCaCert,
        'publishingOptions.publishCrl': caPool.publishingOptions?.publishCrl,
        tier: caPool.tier,
      },
    },
  });
};
