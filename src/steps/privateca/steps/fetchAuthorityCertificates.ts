import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { PrivateCaClient } from '../client';
import { PrivatecaEntities, PrivatecaSteps } from '../constants';
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
          await jobState.addEntity(
            createCertificateEntity({
              data: certificate,
              keyAlgorithm: certificateAuthorityEntity.keyAlgorithm as string,
              projectId: client.projectId,
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
  relationships: [],
  dependsOn: [PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id],
  executionHandler: fetchAuthorityCertificates,
  permissions: ['privateca.certificates.list'],
  apis: ['privateca.googleapis.com'],
};
