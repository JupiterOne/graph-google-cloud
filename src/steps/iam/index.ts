import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IamClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  createIamRoleEntity,
  createIamServiceAccountEntity,
  createIamServiceAccountKeyEntity,
  createIamServiceAccountHasKeyRelationship,
} from './converters';
import {
  STEP_IAM_ROLES,
  IAM_ROLE_ENTITY_TYPE,
  STEP_IAM_SERVICE_ACCOUNTS,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_HAS_KEY_RELATIONSHIP_TYPE,
  IAM_ROLE_ENTITY_CLASS,
  IAM_SERVICE_ACCOUNT_ENTITY_CLASS,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_CLASS,
} from './constants';
import { RelationshipClass } from '@jupiterone/data-model';
import { withErrorHandling } from '../../utils/withErrorHandling';

export * from './constants';

export async function fetchIamRoles(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new IamClient({ config: instance.config });

  await client.iterateCustomRoles(async (role) => {
    await jobState.addEntity(
      createIamRoleEntity(role, {
        custom: true,
      }),
    );
  });
}

export async function fetchIamServiceAccounts(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new IamClient({ config: instance.config });

  await client.iterateServiceAccounts(async (serviceAccount) => {
    const serviceAccountId = serviceAccount.uniqueId as string;
    const serviceAccountName = serviceAccount.name as string;

    const serviceAccountEntity = createIamServiceAccountEntity(serviceAccount);

    await jobState.addEntity(serviceAccountEntity);
    await client.iterateServiceAccountKeys(
      serviceAccountName,
      async (serviceAccountKey) => {
        const serviceAccountKeyEntity = createIamServiceAccountKeyEntity(
          serviceAccountKey,
          {
            serviceAccountId,
            projectId: client.projectId,
          },
        );

        await jobState.addEntity(serviceAccountKeyEntity);
        await jobState.addRelationship(
          createIamServiceAccountHasKeyRelationship({
            serviceAccountEntity,
            serviceAccountKeyEntity,
          }),
        );
      },
    );
  });
}

export const iamSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_IAM_ROLES,
    name: 'Identity and Access Management (IAM) Roles',
    entities: [
      {
        resourceName: 'IAM Role',
        _type: IAM_ROLE_ENTITY_TYPE,
        _class: IAM_ROLE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    executionHandler: fetchIamRoles,
  },
  {
    id: STEP_IAM_SERVICE_ACCOUNTS,
    name: 'Identity and Access Management (IAM) Service Accounts',
    entities: [
      {
        resourceName: 'IAM Service Account',
        _type: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
        _class: IAM_SERVICE_ACCOUNT_ENTITY_CLASS,
      },
      {
        resourceName: 'IAM Service Account Key',
        _type: IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
        _class: IAM_SERVICE_ACCOUNT_KEY_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: IAM_SERVICE_ACCOUNT_HAS_KEY_RELATIONSHIP_TYPE,
        sourceType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
        targetType: IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
      },
    ],
    executionHandler: fetchIamServiceAccounts,
  },
];
