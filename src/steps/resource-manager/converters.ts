import { cloudresourcemanager_v1 } from 'googleapis';
import {
  Entity,
  createDirectRelationship,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

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
