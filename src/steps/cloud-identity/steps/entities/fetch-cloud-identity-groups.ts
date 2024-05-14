import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../../types';
import { CloudIdentityClient } from '../../client';
import {
  CloudIdentityPermissions,
  ENTITY_CLASS_CLOUD_IDENTITY_GROUPS,
  ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
  ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE,
  IngestionSources,
  STEP_CLOUD_IDENTITY_GROUPS,
  STEP_CLOUD_IDENTITY_SSO_PROFILE,
} from '../../constants';
import { createCloudIdentityGroupEntity } from '../../converter';

export async function fetchCloudIdentityGroups(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new CloudIdentityClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_IDENTITY_SSO_PROFILE },
    async (ssoProfile) => {
      const customer = ssoProfile.customer as string;
      const ssoProfileName = ssoProfile.name;
      await client.iterateCloudIdentityGroups(customer, async (group) => {
        const groupEntity = createCloudIdentityGroupEntity(
          group,
          ssoProfileName,
        );
        await jobState.addEntity(groupEntity);
      });
    },
  );
}

export const fetchCloudIdentityGroupsStep: GoogleCloudIntegrationStep = {
  id: STEP_CLOUD_IDENTITY_GROUPS,
  ingestionSourceId: IngestionSources.CLOUD_IDENTITY_GROUPS,
  name: 'Cloud Identity Groups',
  entities: [
    {
      resourceName: 'Cloud Identity Groups',
      _type: ENTITY_TYPE_CLOUD_IDENTITY_GROUPS,
      _class: ENTITY_CLASS_CLOUD_IDENTITY_GROUPS,
    },
  ],
  relationships: [],
  dependsOn: [STEP_CLOUD_IDENTITY_SSO_PROFILE],
  executionHandler: fetchCloudIdentityGroups,
  permissions: CloudIdentityPermissions.CLOUD_IDENTITY_GROUPS,
  apis: ['cloudidentity.googleapis.com'],
};
