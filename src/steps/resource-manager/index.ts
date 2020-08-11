import {
  IntegrationStep,
  Entity,
  JobState,
} from '@jupiterone/integration-sdk-core';
import { ResourceManagerClient, PolicyMemberBinding } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { createIamUserAssignedIamRoleRelationship } from './converters';
import {
  STEP_RESOURCE_MANAGER_IAM_POLICY,
  IAM_SERVICE_ACCOUNT_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
  IAM_USER_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
} from './constants';
import {
  iamSteps,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  IAM_ROLE_ENTITY_TYPE,
  IAM_USER_ENTITY_TYPE,
} from '../iam';
import { cloudresourcemanager_v1 } from 'googleapis';
import { parseIamMember } from '../../utils/iam';
import {
  createIamUserEntity,
  toIamUserEntityKey,
  createIamRoleEntity,
} from '../iam/converters';

export * from './constants';

async function maybeFindOrCreateIamUserEntity({
  jobState,
  projectId,
  member,
}: {
  jobState: JobState;
  projectId: string;
  member: string;
}): Promise<Entity | null> {
  const parsedMember = parseIamMember(member);
  const { identifier: parsedIdentifier, type: parsedMemberType } = parsedMember;

  if (!parsedIdentifier || parsedMemberType === 'domain') {
    // This is a member that we do not want to create. For example: `allAuthenticatedUsers`
    // or `domain:{domain}`.
    return null;
  }

  let userEntity: Entity | null;

  if (parsedMember.type === 'serviceAccount') {
    // We already created service accounts in another step. If this service
    // account does not exist, it's possible that it was created in between
    // steps. The caller handles the case that not entity is returned, so we
    // will just ignore it.
    try {
      userEntity = await jobState.getEntity({
        _type: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
        _key: toIamUserEntityKey({
          projectId,
          memberIdentifier: parsedIdentifier,
        }),
      });
    } catch (err) {
      userEntity = null;
    }
  } else {
    userEntity = await jobState.addEntity(
      createIamUserEntity({
        projectId,
        type: parsedMemberType,
        identifier: parsedIdentifier,
        uniqueid: parsedMember.uniqueid,
        deleted: parsedMember.deleted,
      }),
    );
  }

  return userEntity;
}

async function findOrCreateIamRoleEntity({
  jobState,
  projectId,
  roleName,
}: {
  jobState: JobState;
  projectId: string;
  roleName: string;
}) {
  let roleEntity: Entity;

  try {
    roleEntity = await jobState.getEntity({
      _type: IAM_ROLE_ENTITY_TYPE,
      _key: roleName,
    });
  } catch (err) {
    roleEntity = await jobState.addEntity(
      createIamRoleEntity(
        {
          name: roleName,
          title: roleName,
        },
        {
          custom: false,
        },
      ),
    );
  }

  return roleEntity;
}

async function buildIamUserRoleRelationship({
  jobState,
  projectId,
  data,
}: {
  jobState: JobState;
  projectId: string;
  data: PolicyMemberBinding;
}) {
  const roleName = data.binding.role as string;
  const iamUserEntity = await maybeFindOrCreateIamUserEntity({
    jobState,
    projectId,
    member: data.member,
  });

  if (!iamUserEntity) {
    // This is a user entity that do not want to create, so just exit out now.
    return;
  }

  const iamRoleEntity = await findOrCreateIamRoleEntity({
    jobState,
    projectId,
    roleName,
  });

  await jobState.addRelationship(
    createIamUserAssignedIamRoleRelationship({
      iamUserEntity,
      iamRoleEntity,
      condition: data.binding.condition as cloudresourcemanager_v1.Schema$Expr,
    }),
  );
}

export async function fetchResourceManagerIamPolicy(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ResourceManagerClient({ config });

  await client.iteratePolicyMemberBindings(async (data) => {
    await buildIamUserRoleRelationship({
      jobState,
      projectId: client.projectId,
      data,
    });
  });
}

export const resourceManagerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_RESOURCE_MANAGER_IAM_POLICY,
    name: 'Resource Manager IAM Policy',
    types: [
      IAM_ROLE_ENTITY_TYPE,
      IAM_USER_ENTITY_TYPE,
      IAM_SERVICE_ACCOUNT_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
      IAM_USER_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
    ],
    dependsOn: [...iamSteps.map((step) => step.id)],
    executionHandler: fetchResourceManagerIamPolicy,
  },
];
