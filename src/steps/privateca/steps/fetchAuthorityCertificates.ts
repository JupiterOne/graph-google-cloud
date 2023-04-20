import {
  RelationshipClass,
  createDirectRelationship,
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

async function fetchAuthorityCertificates(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new PrivateCaClient({ config });

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
