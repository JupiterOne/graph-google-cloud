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
  STEP_IAM_CUSTOM_ROLES,
  IAM_ROLE_ENTITY_TYPE,
  STEP_IAM_SERVICE_ACCOUNTS,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_HAS_KEY_RELATIONSHIP_TYPE,
  IAM_ROLE_ENTITY_CLASS,
  IAM_SERVICE_ACCOUNT_ENTITY_CLASS,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_CLASS,
  STEP_IAM_MANAGED_ROLES,
} from './constants';
import { RelationshipClass } from '@jupiterone/data-model';
import { iam_v1 } from 'googleapis';
import { IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY } from '../../utils/iam';

export * from './constants';

export async function fetchIamCustomRoles(
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

/**
 * Fetches all GCP managed IAM roles and caches them in the local job state
 * for later processing/usage
 */
export async function fetchIamManagedRoles(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new IamClient({ config: instance.config });
  const managedRoles: iam_v1.Schema$Role[] = [];

  await client.iterateManagedRoles(async (role) => {
    managedRoles.push(role);
    return Promise.resolve();
  });

  await jobState.setData(IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY, managedRoles);
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
    id: STEP_IAM_CUSTOM_ROLES,
    name: 'Identity and Access Management (IAM) Custom Roles',
    entities: [
      {
        resourceName: 'IAM Custom Role',
        _type: IAM_ROLE_ENTITY_TYPE,
        _class: IAM_ROLE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    executionHandler: fetchIamCustomRoles,
  },
  {
    id: STEP_IAM_MANAGED_ROLES,
    name: 'Identity and Access Management (IAM) Managed Roles',
    entities: [
      {
        resourceName: 'IAM Managed Role',
        _type: IAM_ROLE_ENTITY_TYPE,
        _class: IAM_ROLE_ENTITY_CLASS,
      },
    ],
    relationships: [],
    executionHandler: fetchIamManagedRoles,
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
