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
import { getCaAuthorityEntityKey } from '../converters';
import { privateca_v1 } from 'googleapis';
import { PrivateCaClient } from '../client';

async function buildCertificateAuthorityCertificateRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    logger,
    instance: { config },
  } = context;

  await jobState.iterateEntities(
    { _type: PrivatecaEntities.PRIVATE_CA_CERTIFICATE._type },
    async (caCertificate) => {
      const client = new PrivateCaClient({ config });
      const caCertificateEntity =
        getRawData<privateca_v1.Schema$Certificate>(caCertificate);
      const certificateIssuer = caCertificateEntity?.issuerCertificateAuthority;

      if (!certificateIssuer) return;

      const certificateAuthorityEntity = await jobState.findEntity(
        getCaAuthorityEntityKey({
          projectId: client.projectId,
          location: certificateIssuer?.split('/')[3],
          caPoolId: certificateIssuer?.split('/')[5],
          certificateAuthorityId: certificateIssuer?.split('/')[7],
        }),
      );

      if (!certificateAuthorityEntity) {
        logger.warn(
          `${PrivatecaSteps.STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_CERTIFICATE_RELATIONSHIPS.id} - Unable to create relationship. Missing certificateAuthorityEntity`,
        );

        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.CREATED,
          from: certificateAuthorityEntity,
          to: caCertificate,
        }),
      );
    },
  );
}

export const buildCertificateAuthorityCertificateRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_CERTIFICATE_RELATIONSHIPS
      .id,
    name: PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_CERTIFICATE_AUTHORITY_CERTIFICATE_RELATIONSHIPS
      .name,
    entities: [],
    relationships: [
      PrivatecaRelationships.PRIVATE_CA_CERTIFICATE_AUTHORITY_CERTIFICATE,
    ],
    dependsOn: [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATES.id],
    executionHandler: buildCertificateAuthorityCertificateRelationships,
  };
