import { privateca_v1 } from 'googleapis';
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
import { createCertificateAuthorityEntity } from '../converters';
import { isMemberPublic } from '../../../utils/iam';
import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';

function isCertificateAuthorityPolicyPublicAccess(
  caPolicy: privateca_v1.Schema$Policy,
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

async function fetchCertificateAuthorities(
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
      _type: PrivatecaEntities.PRIVATE_CA_POOL._type,
    },
    async (caPool) => {
      const caPoolId = caPool._key.split('/')[5];
      const location = caPool._key.split('/')[3];

      if (!location || !caPool) {
        logger.warn(
          { location, caPoolId },
          `${PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id} - Unable to fetch CA due to missing parameters.`,
        );

        return;
      }

      await client.iterateCertificateAuthorities(
        caPoolId,
        location,
        async (certificateAuthority) => {
          const caPoolId = certificateAuthority.name?.split('/')[5];
          const location = certificateAuthority.name?.split('/')[3];

          const policy = await client.getAuthorityPolicy(
            caPoolId as string,
            location as string,
          );

          const certificateAuthorityEntity = createCertificateAuthorityEntity({
            data: certificateAuthority,
            projectId: client.projectId,
            isPublic: isCertificateAuthorityPolicyPublicAccess(policy),
          });

          await jobState.addEntity(certificateAuthorityEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: caPool,
              to: certificateAuthorityEntity,
            }),
          );
        },
      );
    },
  );
}

export const fetchCertificateAuthoritiesStepMap: GoogleCloudIntegrationStep = {
  id: PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id,
  name: PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.name,
  entities: [PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY],
  relationships: [PrivatecaRelationships.PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY],
  dependsOn: [PrivatecaSteps.STEP_PRIVATE_CA_POOLS.id],
  executionHandler: fetchCertificateAuthorities,
  permissions: [
    'privateca.certificateAuthorities.getIamPolicy',
    'privateca.certificateAuthorities.list',
  ],
  apis: ['privateca.googleapis.com'],
};
