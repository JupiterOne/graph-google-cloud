import {
  createDirectRelationship,
  IntegrationLogger,
  JobState,
} from '@jupiterone/integration-sdk-core';
import { IamClient } from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
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
  STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS,
} from './constants';
import { RelationshipClass } from '@jupiterone/data-model';
import { iam_v1 } from 'googleapis';
import {
  getUniqueFullServiceApiNamesFromRole,
  IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY,
} from '../../utils/iam';
import {
  ServiceUsageEntities,
  ServiceUsageStepIds,
} from '../service-usage/constants';
import { getServiceApiEntityKey } from '../service-usage/converters';
import { ownerPermissions } from './basic-permissions/owner';
import { viewerPermissions } from './basic-permissions/viewer';
import { editorPermissions } from './basic-permissions/editor';

export * from './constants';

async function createApiServiceEntityHasIamRoleRelationships({
  logger,
  projectId,
  jobState,
  iamRoleIncludedPermissions,
  iamRoleEntityKey,
  serviceApiEntityKeySeenMap,
}: {
  logger: IntegrationLogger;
  projectId: string;
  jobState: JobState;
  iamRoleIncludedPermissions: string[] | null | undefined;
  iamRoleEntityKey: string;
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
  const serviceApiNamesForRole = getUniqueFullServiceApiNamesFromRole(
    iamRoleIncludedPermissions,
  );

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
        fromType: ServiceUsageEntities.API_SERVICE._type,
        fromKey: serviceApiEntityKey,
        toType: IAM_ROLE_ENTITY_TYPE,
        toKey: iamRoleEntityKey,
      }),
    );
  }
}

export async function fetchIamCustomRoles(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new IamClient({ config: instance.config }, logger);

  let numCustomRoles = 0;

  await client.iterateCustomRoles(async (role) => {
    await jobState.addEntity(
      createIamRoleEntity(role, {
        custom: true,
      }),
    );

    numCustomRoles++;
  });

  logger.info({ numCustomRoles }, 'Created custom role entities');
}

export async function buildIamCustomRoleApiServiceRelationship(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const serviceApiEntityKeySeenMap: Map<string, boolean> = new Map();

  await jobState.iterateEntities(
    {
      _type: IAM_ROLE_ENTITY_TYPE,
    },
    async (iamRoleEntity) => {
      // Only consider custom roles
      if (iamRoleEntity.custom !== true) return;

      await createApiServiceEntityHasIamRoleRelationships({
        logger,
        projectId: instance.config.projectId!,
        jobState,
        iamRoleEntityKey: iamRoleEntity._key,
        iamRoleIncludedPermissions: iamRoleEntity.permissions as
          | string[]
          | null
          | undefined,
        serviceApiEntityKeySeenMap,
      });
    },
  );
}

/**
 * Fetches all GCP managed IAM roles and caches them in the local job state
 * for later processing/usage
 */
export async function fetchIamManagedRoles(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new IamClient({ config: instance.config }, logger);
  const managedRoles: { [k: string]: iam_v1.Schema$Role } = {};

  await client.iterateManagedRoles((role) => {
    if (role?.name) {
      managedRoles[role.name] = role;

      /**
       * We have learned that GCP basic roles have non-deterministic behavior on
       * their listed permissions. We hard-code the permission set based on
       * previously determined data
       */
      if (role.name === 'roles/owner')
        role.includedPermissions = ownerPermissions;
      else if (role.name === 'roles/editor')
        role.includedPermissions = editorPermissions;
      else if (role.name === 'roles/viewer')
        role.includedPermissions = viewerPermissions;
    }
  });

  await jobState.setData(IAM_MANAGED_ROLES_DATA_JOB_STATE_KEY, managedRoles);
}

export async function fetchIamServiceAccounts(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new IamClient({ config: instance.config }, logger);

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

export const iamSteps: GoogleCloudIntegrationStep[] = [
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
    dependsOn: [],
    permissions: ['iam.roles.list'],
    apis: ['iam.googleapis.com'],
  },
  {
    id: STEP_IAM_CUSTOM_ROLE_SERVICE_API_RELATIONSHIPS,
    name: 'Identity and Access Management (IAM) Custom Roles to Service API relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: API_SERVICE_HAS_IAM_ROLE_RELATIONSHIP_TYPE,
        sourceType: ServiceUsageEntities.API_SERVICE._type,
        targetType: IAM_ROLE_ENTITY_TYPE,
      },
    ],
    executionHandler: buildIamCustomRoleApiServiceRelationship,
    dependsOn: [STEP_IAM_CUSTOM_ROLES, ServiceUsageStepIds.FETCH_API_SERVICES],
  },
  {
    id: STEP_IAM_MANAGED_ROLES,
    name: 'Identity and Access Management (IAM) Managed Roles',
    entities: [],
    relationships: [],
    executionHandler: fetchIamManagedRoles,
    permissions: ['iam.roles.list'],
    apis: ['iam.googleapis.com'],
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
    permissions: ['iam.serviceAccounts.list', 'iam.serviceAccountKeys.list'],
    apis: ['iam.googleapis.com'],
  },
];
