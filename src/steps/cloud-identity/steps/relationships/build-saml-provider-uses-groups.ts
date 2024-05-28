import {
  IntegrationMissingKeyError,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import {
  ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
  ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
  RELATIONSHIP_TYPE_SAML_PROVIDER_USES_GROUP,
  STEP_CLOUD_IDENTITY_GROUPS,
  STEP_CLOUD_IDENTITY_SAML_PROVIDER_USES_GROUP,
  STEP_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
} from '../../constants';
import { CloudIdentityClient } from '../../client';

export async function buildCloudIdentitySamlProviderUsesGroupRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  const client = new CloudIdentityClient(
    {
      config: context.instance.config,
    },
    logger,
  );
  await client.iterateCloudIdentitySsoAssignment(async (ssoAssignement) => {
    const groupKey = ssoAssignement.targetGroup?.split('/')[1];
    const samlProviderKey = `SAML PROVIDER: ${ssoAssignement.samlSsoInfo?.inboundSamlSsoProfile?.split('/')[1]}`;

    if (!groupKey || !samlProviderKey) return; // Group or saml provider data not present in response

    if (!jobState.hasKey(groupKey)) {
      throw new IntegrationMissingKeyError(`Error: Key not Found
        Details:
        Step Id: ${STEP_CLOUD_IDENTITY_SAML_PROVIDER_USES_GROUP}
        Entity Name: Group
        Group Key: ${groupKey}`);
    }

    if (!jobState.hasKey(samlProviderKey)) {
      throw new IntegrationMissingKeyError(`Error: Key not Found
          Details:
          Step Id: ${STEP_CLOUD_IDENTITY_SAML_PROVIDER_USES_GROUP}
          Entity Name: Saml Provider
          SAML Provider Key: ${samlProviderKey}`);
    }
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.USES,
        fromKey: samlProviderKey,
        fromType: ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
        toKey: groupKey,
        toType: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
      }),
    );
  });
}

export const buildCloudIdentitySamlProviderUsesGroupStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_IDENTITY_SAML_PROVIDER_USES_GROUP,
    name: 'Cloud Identity SAML Provider Uses Group Relationship',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_SAML_PROVIDER_USES_GROUP,
        sourceType: ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
        targetType: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
      },
    ],
    dependsOn: [
      STEP_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
      STEP_CLOUD_IDENTITY_GROUPS,
    ],
    executionHandler: buildCloudIdentitySamlProviderUsesGroupRelationship,
  };
