import {
  createDirectRelationship,
  Entity,
  IntegrationLogger,
  IntegrationStep,
  JobState,
} from '@jupiterone/integration-sdk-core';
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
  API_SERVICE_HAS_IAM_ROLE_RELATIONSHIP_TYPE,
} from './constants';
import { RelationshipClass } from '@jupiterone/data-model';
import { iam_v1 } from 'googleapis';
import {
  getUniqueFullServiceApiNamesFromRole,
  IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY,
} from '../../utils/iam';
import {
  API_SERVICE_ENTITY_TYPE,
  STEP_API_SERVICES,
} from '../service-usage/constants';
import { getServiceApiEntityKey } from '../service-usage/converters';

export * from './constants';

async function createApiServiceEntityHasIamRoleRelationships({
  logger,
  projectId,
  jobState,
  role,
  iamRoleEntity,
  serviceApiEntityKeySeenMap,
}: {
  logger: IntegrationLogger;
  projectId: string;
  jobState: JobState;
  role: iam_v1.Schema$Role;
  iamRoleEntity: Entity;
  /**
   *
   * There will be many role permissions that result in duplicate service API entity
   * lookups. This is a cache, so that we prevent doing too much duplicate work.
   *
   * NOTE: This map will not contain many keys (hundreds at most), so memory
   * consumption is not an issue.
   */
  serviceApiEntityKeySeenMap: Map<string, boolean>;
}) {
  const serviceApiNamesForRole = getUniqueFullServiceApiNamesFromRole(role);

  for (const serviceApiName of serviceApiNamesForRole) {
    const serviceApiEntityKey = getServiceApiEntityKey({
      projectId,
      serviceApiName,
    });

    const serviceApiEntityKeySeenMapValue =
      serviceApiEntityKeySeenMap.get(serviceApiEntityKey);

    if (serviceApiEntityKeySeenMapValue === undefined) {
      const serviceApiEntity = await jobState.findEntity(serviceApiEntityKey);

      if (!serviceApiEntity) {
        logger.warn(
          {
            serviceApiName,
          },
          'Could not find service API entity when attempting to build relationship to role',
        );
        serviceApiEntityKeySeenMap.set(serviceApiEntityKey, false);
        continue;
      }

      serviceApiEntityKeySeenMap.set(serviceApiEntityKey, true);
    } else if (serviceApiEntityKeySeenMapValue === false) {
      continue;
    }

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        fromType: API_SERVICE_ENTITY_TYPE,
        fromKey: serviceApiEntityKey,
        toType: IAM_ROLE_ENTITY_TYPE,
        toKey: iamRoleEntity._key,
      }),
    );
  }
}

export async function fetchIamCustomRoles(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new IamClient({ config: instance.config });
  const serviceApiEntityKeySeenMap: Map<string, boolean> = new Map();
  let numCustomRoles = 0;

  await client.iterateCustomRoles(async (role) => {
    const iamRoleEntity = await jobState.addEntity(
      createIamRoleEntity(role, {
        custom: true,
      }),
    );

    await createApiServiceEntityHasIamRoleRelationships({
      logger,
      projectId: client.projectId,
      jobState,
      role,
      iamRoleEntity,
      serviceApiEntityKeySeenMap,
    });

    numCustomRoles++;
  });

  logger.info({ numCustomRoles }, 'Created custom role entities');
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
  const managedRoles: { [k: string]: iam_v1.Schema$Role } = {};

  await client.iterateManagedRoles(async (role) => {
    if (role?.name) {
      managedRoles[role.name] = role;
    }
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
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: API_SERVICE_HAS_IAM_ROLE_RELATIONSHIP_TYPE,
        sourceType: API_SERVICE_ENTITY_TYPE,
        targetType: IAM_ROLE_ENTITY_TYPE,
      },
    ],
    executionHandler: fetchIamCustomRoles,
    dependsOn: [STEP_API_SERVICES],
  },
  {
    id: STEP_IAM_MANAGED_ROLES,
    name: 'Identity and Access Management (IAM) Managed Roles',
    entities: [],
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
