import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { CloudIdentityClient } from '../../client';
import {
  CloudIdentityPermissions,
  ENTITY_CLASS_CLOUD_IDENTITY_SSO_PROFILE,
  ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
  IngestionSources,
  STEP_CLOUD_IDENTITY_SSO_PROFILE,
} from '../../constants';
import { createCloudIdentitySSOProfileEntity } from '../../converter';

export async function fetchCloudIdentitySSOProfile(
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
    const ssoProfileEntity = createCloudIdentitySSOProfileEntity(ssoProfile);
    await jobState.addEntity(ssoProfileEntity);
  });
}

export const fetchCloudIdentitySSOProfileStep: GoogleCloudIntegrationStep = {
  id: STEP_CLOUD_IDENTITY_SSO_PROFILE,
  ingestionSourceId: IngestionSources.CLOUD_IDENTITY_SSO_PROFILE,
  name: 'Cloud Identity SSO Profile',
  entities: [
    {
      resourceName: 'Cloud Identity SSO Profile',
      _type: ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
      _class: ENTITY_CLASS_CLOUD_IDENTITY_SSO_PROFILE,
    },
  ],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchCloudIdentitySSOProfile,
  permissions: CloudIdentityPermissions.CLOUD_IDENTITY_SSO_PROFILE,
  apis: ['cloudidentity.googleapis.com'],
};
