import { cloudresourcemanager_v1 } from 'googleapis';
import {
  Entity,
  createDirectRelationship,
  Relationship,
  RelationshipClass,
  convertProperties,
  parseTimePropertyValue,
  RelationshipDirection,
  createMappedRelationship,
  generateRelationshipType,
  generateRelationshipKey,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';
import {
  PROJECT_ENTITY_TYPE,
  PROJECT_ENTITY_CLASS,
  ORGANIZATION_ENTITY_TYPE,
  ORGANIZATION_ENTITY_CLASS,
} from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { IamUserEntityWithParsedMember } from '.';
import { IAM_ROLE_ENTITY_TYPE } from '../iam';

function getConditionRelationshipProperties(
  condition: cloudresourcemanager_v1.Schema$Expr,
) {
  return {
    conditionDescription: condition.description,
    conditionExpression: condition.expression,
    conditionLocation: condition.location,
    conditionTitle: condition.title,
  };
}

export function createIamServiceAccountAssignedIamRoleRelationship(params: {
  iamUserEntity: Entity;
  iamRoleEntity: Entity;
  projectId: string;
  condition?: cloudresourcemanager_v1.Schema$Expr;
}): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.ASSIGNED,
    from: params.iamUserEntity,
    to: params.iamRoleEntity,
    properties: {
      projectId: params.projectId,
      ...(params.condition &&
        getConditionRelationshipProperties(params.condition)),
    },
  });
}

export function createGoogleWorkspaceEntityTypeAssignedIamRoleMappedRelationship({
  targetEntityType,
  iamRoleEntityKey,
  iamUserEntityWithParsedMember,
  projectId,
  condition,
}: {
  targetEntityType: 'google_group' | 'google_user';
  iamRoleEntityKey: string;
  iamUserEntityWithParsedMember: IamUserEntityWithParsedMember;
  projectId: string;
  condition?: cloudresourcemanager_v1.Schema$Expr;
}): Relationship {
  const email = iamUserEntityWithParsedMember.parsedMember.identifier;

  if (!email) {
    // NOTE: This should never happen, but placing here for safety.
    throw new IntegrationError({
      message:
        'createGoogleWorkspaceEntityTypeAssignedIamRoleMappedRelationship requires a parsed member identifier.',
      code: 'UNPROCESSABLE_GOOGLE_WORKSPACE_MAPPED_RELATIONSHIP',
    });
  }

  return createMappedRelationship({
    _class: RelationshipClass.ASSIGNED,
    _mapping: {
      relationshipDirection: RelationshipDirection.REVERSE,
      sourceEntityKey: iamRoleEntityKey,
      targetFilterKeys: [['_type', 'email']],
      skipTargetCreation: false,
      targetEntity: {
        _type: targetEntityType,
        email,
        username: iamUserEntityWithParsedMember.parsedMember.identifier,
        deleted: iamUserEntityWithParsedMember.parsedMember.deleted,
      },
    },
    properties: {
      _type: generateRelationshipType(
        RelationshipClass.ASSIGNED,
        targetEntityType,
        IAM_ROLE_ENTITY_TYPE,
      ),
      _key: generateRelationshipKey(
        RelationshipClass.ASSIGNED,
        email,
        iamRoleEntityKey,
      ),
      projectId: projectId,
      ...(condition && getConditionRelationshipProperties(condition)),
    },
  });
}

export function createProjectEntity(
  projectId: string,
  project: cloudresourcemanager_v1.Schema$Project | undefined = {},
) {
  return createGoogleCloudIntegrationEntity(project, {
    entityData: {
      source: project,
      assign: {
        ...convertProperties(project.parent || {}, { prefix: 'parent' }),
        _key: projectId,
        _type: PROJECT_ENTITY_TYPE,
        _class: PROJECT_ENTITY_CLASS,
        name: project.name || projectId,
        projectNumber: project.projectNumber,
        lifecycleState: project.lifecycleState,
        createdOn: parseTimePropertyValue(project.createTime),
      },
    },
  });
}

export function createOrganizationEntity(
  data: cloudresourcemanager_v1.Schema$Organization,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ORGANIZATION_ENTITY_TYPE,
        _class: ORGANIZATION_ENTITY_CLASS,
        name: data.name,
        displayName: data.name as string,
        lifecycleState: data.lifecycleState,
        createdOn: parseTimePropertyValue(data.creationTime),
      },
    },
  });
}
