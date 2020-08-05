import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IamClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createIamRoleEntity } from './converters';
import { STEP_IAM_ROLES, IAM_ROLE_ENTITY_TYPE } from './constants';

export * from './constants';

export async function fetchIamRoles(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new IamClient({ config: instance.config });

  await client.iterateCustomRoles(
    async (role) =>
      await jobState.addEntity(createIamRoleEntity(role, { custom: true })),
  );
}

export const iamSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_IAM_ROLES,
    name: 'Identity and Access Management (IAM)',
    types: [IAM_ROLE_ENTITY_TYPE],
    executionHandler: fetchIamRoles,
  },
];
