import { cloudresourcemanager_v1 } from 'googleapis';
import {
  Entity,
  createDirectRelationship,
  Relationship,
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
  condition?: cloudresourcemanager_v1.Schema$Expr;
}): Relationship {
  return createDirectRelationship({
    _class: 'ASSIGNED',
    from: params.iamUserEntity,
    to: params.iamRoleEntity,
    properties: {
      ...(params.condition &&
        getConditionRelationshipProperties(params.condition)),
    },
  });
}
