import { cloudresourcemanager_v1 } from 'googleapis';
import {
  Entity,
  createDirectRelationship,
  Relationship,
  RelationshipClass,
  createIntegrationEntity,
  convertProperties,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { PROJECT_ENTITY_TYPE, PROJECT_ENTITY_CLASS } from './constants';

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

export function createIamUserAssignedIamRoleRelationship(params: {
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

export function createProjectEntity(
  project: cloudresourcemanager_v1.Schema$Project,
) {
  return createIntegrationEntity({
    entityData: {
      source: project,
      assign: {
        ...convertProperties(project.parent || {}, { prefix: 'parent' }),
        _key: project.projectId!,
        _type: PROJECT_ENTITY_TYPE,
        _class: PROJECT_ENTITY_CLASS,
        name: project.name,
        projectNumber: project.projectNumber,
        lifecycleState: project.lifecycleState,
        createdOn: parseTimePropertyValue(project.createTime),
      },
    },
  });
}
