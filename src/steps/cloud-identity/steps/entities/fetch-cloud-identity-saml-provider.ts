import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { CloudIdentityClient } from '../../client';
import {
  CloudIdentityPermissions,
  ENTITY_CLASS_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
  ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
  IngestionSources,
  STEP_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
} from '../../constants';
import { createCloudIdentitySSOSamlProviderEntity } from '../../converter';

export async function fetchCloudIdentitySSOSamlProvider(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new CloudIdentityClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateCloudIdentitySsoProfile(async (ssoProfile) => {
    

    const ssoSamlProviderEntity = createCloudIdentitySSOSamlProviderEntity(
      ssoProfile
    );
    await jobState.addEntity(ssoSamlProviderEntity);
  });
}

export const fetchCloudIdentitySSOSamlProviderStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
    ingestionSourceId: IngestionSources.CLOUD_IDENTITY_SSO_SAML_PROVIDER,
    name: 'Cloud Identity SSO Saml Provider',
    entities: [
      {
        resourceName: 'Cloud Identity SSO Saml Provider',
        _type: ENTITY_TYPE_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
        _class: ENTITY_CLASS_CLOUD_IDENTITY_SSO_SAML_PROVIDER,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCloudIdentitySSOSamlProvider,
    permissions: CloudIdentityPermissions.CLOUD_IDENTITY_SSO_SAML_PROVIDER,
    apis: ['cloudidentity.googleapis.com'],
  };
