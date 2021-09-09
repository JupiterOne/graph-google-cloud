import { cloudresourcemanager_v1, cloudresourcemanager_v3 } from 'googleapis';
import {
  Relationship,
  RelationshipClass,
  parseTimePropertyValue,
  RelationshipDirection,
  createMappedRelationship,
  generateRelationshipType,
  Entity,
  PrimitiveEntity,
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
import { getGoogleCloudConsoleWebLink } from '../../utils/url';

export function getConditionRelationshipProperties(
  condition: cloudresourcemanager_v1.Schema$Expr,
) {
  return {
    conditionDescription: condition.description,
    conditionExpression: condition.expression,
    conditionLocation: condition.location,
    conditionTitle: condition.title,
  };
}

export function createGoogleWorkspaceEntityTypeAssignedIamRoleMappedRelationship({
  iamEntity,
  targetEntity,
  relationshipDirection,
  projectId,
  condition,
}: {
  iamEntity: Entity;
  targetEntity: Partial<PrimitiveEntity>;
  relationshipDirection: RelationshipDirection;
  projectId?: string;
  condition?: cloudresourcemanager_v1.Schema$Expr;
}): Relationship {
  return createMappedRelationship({
    _class: RelationshipClass.ASSIGNED,
    _mapping: {
      relationshipDirection,
      sourceEntityKey: iamEntity._key,
      targetFilterKeys: targetEntity._key // Not always able to determine a _key for google_users depending on how the binding is set up
        ? [['_key', '_type']]
        : [['_type', 'email']],
      /**
       * The mapper does properly remove mapper-created entities at the moment. These
       * entities will never be cleaned up which will causes duplicates.
       *
       * Until this is fixed, we should not create mapped relatioonships with target creation
       * enabled, thus only creating iam entity relationships to targets that have already
       * been ingested by other integrations.
       */
      // skipTargetCreation: false, // true is the default
      targetEntity,
    },
    properties: {
      _type: generateRelationshipType(
        RelationshipClass.ASSIGNED,
        relationshipDirection === RelationshipDirection.FORWARD
          ? iamEntity._type
          : targetEntity._type!,
        relationshipDirection === RelationshipDirection.FORWARD
          ? targetEntity._type!
          : iamEntity._type,
      ),
      projectId,
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
