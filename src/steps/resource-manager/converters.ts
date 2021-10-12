import { cloudresourcemanager_v3 } from 'googleapis';
import {
  createMappedRelationship,
  Entity,
  generateRelationshipType,
  parseTimePropertyValue,
  PrimitiveEntity,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
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
import { getConditionRelationshipProperties } from '../cloud-asset';

export * from './constants';

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
        parent: data.parent,
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

export function createGoogleWorkspaceEntityTypeAssignedIamRoleMappedRelationship({
  roleEntity,
  targetEntity,
  projectId,
  condition,
}: {
  roleEntity: Entity;
  targetEntity: Partial<PrimitiveEntity>;
  projectId?: string;
  condition?: cloudresourcemanager_v3.Schema$Expr;
}): Relationship {
  return createMappedRelationship({
    _class: RelationshipClass.ASSIGNED,
    _mapping: {
      relationshipDirection: RelationshipDirection.REVERSE,
      sourceEntityKey: roleEntity._key,
      targetFilterKeys: targetEntity._key // Not always able to determine a _key for google_users depending on how the binding is set up
        ? [['_key', '_type']]
        : [['_type', 'email']],
      /**
       * The mapper does not properly remove mapper-created entities at the moment. These
       * entities will never be cleaned up which will causes duplicates.
       *
       * Until this is fixed, we should not create mapped relationships with target creation
       * enabled, thus only creating iam entity relationships to targets that have already
       * been ingested by other integrations.
       */
      targetEntity,
    },
    properties: {
      _type: generateRelationshipType(
        RelationshipClass.ASSIGNED,
        targetEntity._type!,
        roleEntity._type,
      ),
      projectId,
      ...(condition && getConditionRelationshipProperties(condition)),
      _deprecationDate: '01-01-2022',
    },
  });
}
