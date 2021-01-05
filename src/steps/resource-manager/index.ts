import {
  IntegrationStep,
  Entity,
  JobState,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { ResourceManagerClient, PolicyMemberBinding } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  createIamUserAssignedIamRoleRelationship,
  createProjectEntity,
} from './converters';
import {
  STEP_RESOURCE_MANAGER_IAM_POLICY,
  STEP_PROJECT,
  IAM_SERVICE_ACCOUNT_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
  IAM_USER_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
  PROJECT_ENTITY_TYPE,
} from './constants';
import {
  iamSteps,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  IAM_ROLE_ENTITY_TYPE,
  IAM_USER_ENTITY_TYPE,
  IAM_ROLE_ENTITY_CLASS,
  IAM_USER_ENTITY_CLASS,
} from '../iam';
import { cloudresourcemanager_v1 } from 'googleapis';
import { parseIamMember } from '../../utils/iam';
import { createIamUserEntity, createIamRoleEntity } from '../iam/converters';
import { RelationshipClass } from '@jupiterone/data-model';

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

  // We always want to find or create relationships to user entities. Since
  // the same user can have multiple roles, there is a possibility that a
  // user is created earlier in this step. In order to avoid duplicate entity
  // keys, we need to look for the user before creating anything.
  const userEntity = await jobState.findEntity(parsedIdentifier);
  if (parsedMember.type === 'serviceAccount') {
    // We already created service accounts in another step. If this service
    // account does not exist, it's possible that it was created in between
    // steps. The caller handles the case that not entity is returned, so we
    // will just ignore it.
    return userEntity;
  }
  return (
    userEntity ||
    (await jobState.addEntity(
      createIamUserEntity({
        type: parsedMemberType,
        identifier: parsedIdentifier,
        uniqueid: parsedMember.uniqueid,
        deleted: parsedMember.deleted,
      }),
    ))
  );
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
  const roleEntity = await jobState.findEntity(roleName);

  if (roleEntity) {
    return roleEntity;
  }

  return jobState.addEntity(
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

async function buildIamUserRoleRelationship({
  jobState,
  projectId,
  data,
}: {
  jobState: JobState;
  projectId: string;
  data: PolicyMemberBinding;
}): Promise<Relationship | undefined> {
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

  return createIamUserAssignedIamRoleRelationship({
    iamUserEntity,
    iamRoleEntity,
    projectId,
    condition: data.binding.condition as cloudresourcemanager_v1.Schema$Expr,
  });
}

export async function fetchResourceManagerProject(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;
  const client = new ResourceManagerClient({ config });

  let project;
  try {
    project = await client.getProject();
  } catch (err) {
    // This step _always_ executes because it creates a root `Account` entity for the integration instance.
    // However, users can only fetch the project details if cloudresourcemanager API is enabled.
    const message =
      'Could not fetch project from Cloud Resource Manager API. Ensure the API is enabled and the service account has the ' +
      '`resourcemanager.projects.get` permission (see ' +
      'https://github.com/JupiterOne/graph-google-cloud/blob/master/docs/development.md#enabling-google-cloud-services) ' +
      `${JSON.stringify({ code: err.code, message: err.message })}`;
    if (err.code === 403) {
      logger.warn({ err }, message);
    } else {
      logger.error({ err }, message);
    }
    logger.publishEvent({
      name: 'auth_error',
      description: message,
    });
  }

  const projectEntity = createProjectEntity(
    config.serviceAccountKeyConfig.project_id,
    project,
  );

  await jobState.setData(PROJECT_ENTITY_TYPE, projectEntity);
  await jobState.addEntity(projectEntity);
}

export async function fetchResourceManagerIamPolicy(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const client = new ResourceManagerClient({ config });
  const relationships = new Set<string>();

  await client.iteratePolicyMemberBindings(async (data) => {
    const relationship = await buildIamUserRoleRelationship({
      jobState,
      projectId: client.projectId,
      data,
    });

    if (!relationship || relationships.has(relationship._key)) {
      return;
    }

    await jobState.addRelationship(relationship);
    relationships.add(relationship._key);
  });
}

export const resourceManagerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_PROJECT,
    name: 'Resource Manager Project',
    entities: [
      {
        resourceName: 'Project',
        _type: 'google_cloud_project',
        _class: 'Account',
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchResourceManagerProject,
  },
  {
    id: STEP_RESOURCE_MANAGER_IAM_POLICY,
    name: 'Resource Manager IAM Policy',
    entities: [
      {
        resourceName: 'IAM Role',
        _type: IAM_ROLE_ENTITY_TYPE,
        _class: IAM_ROLE_ENTITY_CLASS,
      },
      {
        resourceName: 'IAM User',
        _type: IAM_USER_ENTITY_TYPE,
        _class: IAM_USER_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.ASSIGNED,
        _type: IAM_SERVICE_ACCOUNT_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
        sourceType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
        targetType: IAM_ROLE_ENTITY_TYPE,
      },
      {
        _class: RelationshipClass.ASSIGNED,
        _type: IAM_USER_ASSIGNED_ROLE_RELATIONSHIP_TYPE,
        sourceType: IAM_USER_ENTITY_TYPE,
        targetType: IAM_ROLE_ENTITY_TYPE,
      },
    ],
    dependsOn: [...iamSteps.map((step) => step.id)],
    executionHandler: fetchResourceManagerIamPolicy,
  },
];
