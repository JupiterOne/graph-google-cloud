import { cloudresourcemanager_v1, cloudresourcemanager_v3 } from 'googleapis';
import {
  Entity,
  createDirectRelationship,
  Relationship,
  RelationshipClass,
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
  FOLDER_ENTITY_TYPE,
  FOLDER_ENTITY_CLASS,
} from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { IamUserEntityWithParsedMember } from '.';
import { IAM_ROLE_ENTITY_TYPE } from '../iam';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';

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

export function createOrganizationEntity(
  data: cloudresourcemanager_v3.Schema$Organization,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ORGANIZATION_ENTITY_TYPE,
        _class: ORGANIZATION_ENTITY_CLASS,
        name: data.name,
        displayName: data.displayName as string,
        directoryCustomerId: data.directoryCustomerId,
        etag: data.etag,
        lifecycleState: data.state,
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export function createFolderEntity(
  data: cloudresourcemanager_v3.Schema$Folder,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: FOLDER_ENTITY_TYPE,
        _class: FOLDER_ENTITY_CLASS,
        name: data.name,
        displayName: data.displayName as string,
        etag: data.etag,
        lifecycleState: data.state,
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export function createProjectEntity(
  projectId: string,
  project: cloudresourcemanager_v3.Schema$Project | undefined = {},
) {
  const primaryProjectId = project.projectId || projectId;

  return createGoogleCloudIntegrationEntity(project, {
    entityData: {
      source: project,
      assign: {
        _key: project.name || primaryProjectId,
        _type: PROJECT_ENTITY_TYPE,
        _class: PROJECT_ENTITY_CLASS,
        id: primaryProjectId,
        projectId: primaryProjectId,
        name: project.name || primaryProjectId,
        displayName: project.displayName as string,
        parent: project.parent,
        lifecycleState: project.state,
        createdOn: parseTimePropertyValue(project.createTime),
        updatedOn: parseTimePropertyValue(project.updateTime),
        webLink: getGoogleCloudConsoleWebLink(
          `/home/dashboard?project=${primaryProjectId}`,
        ),
      },
    },
  });
}
