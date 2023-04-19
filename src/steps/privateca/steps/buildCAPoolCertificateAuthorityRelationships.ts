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
import { privateca_v1 } from 'googleapis';
import { getCaPoolEntityKey } from '../converters';

async function buildCAPoolCertificateAuthorityRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: PrivatecaEntities.PRIVATE_CA_CERTIFICATE_AUTHORITY._type },
    async (caAuthorityEntity) => {
      const caAuthEntity =
        getRawData<privateca_v1.Schema$CertificateAuthority>(caAuthorityEntity);

      if (!caAuthEntity) {
        logger.warn(
          `${PrivatecaSteps.STEP_CREATE_PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY_RELATIONSHIPS.id} - Could not find raw data on certificate authority entity`,
        );
        return;
      }

      const caPoolEntity = await jobState.findEntity(
        getCaPoolEntityKey({
          projectId: (caAuthorityEntity.name as string).split('/')[1],
          location: (caAuthorityEntity.name as string).split('/')[3],
          caPoolId: (caAuthorityEntity.name as string).split('/')[5],
        }),
      );

      if (!caPoolEntity || !caAuthorityEntity) {
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: caPoolEntity,
          to: caAuthorityEntity,
        }),
      );
    },
  );
}

export const buildCAPoolCertificateAuthorityRelationshipsStepMap: GoogleCloudIntegrationStep =
  {
    id: PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY_RELATIONSHIPS.id,
    name: PrivatecaSteps
      .STEP_CREATE_PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY_RELATIONSHIPS.name,
    entities: [],
    relationships: [
      PrivatecaRelationships.PRIVATE_CA_POOL_CERTIFICATE_AUTHORITY,
    ],
    dependsOn: [
      PrivatecaSteps.STEP_PRIVATE_CA_POOLS.id,
      PrivatecaSteps.STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES.id,
    ],
    executionHandler: buildCAPoolCertificateAuthorityRelationships,
  };
