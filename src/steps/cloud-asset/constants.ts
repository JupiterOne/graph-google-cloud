import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { ANY_RESOURCE } from '../../constants';
import {
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_TYPE,
  IAM_ROLE_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
} from '../iam';

export const CLOUD_ASSET_STEPS = {
  BINDINGS: 'fetch-iam-bindings',
};

export const bindingEntities = {
  BINDINGS: {
    _type: 'google_iam_binding',
    _class: ['AccessPolicy'], // Technically not a policy, but functions just like one. IAM Policies are groups of IAM bindings.
    resourceName: 'IAM Binding',
  },
};

const IAM_TARGET_TYPES = [
  'google_domain', // Don't know what to do with this yet
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_TYPE,
];

export const BINDING_TARGET_RELATIONSHIPS = IAM_TARGET_TYPES.map(
  (targetType) => {
    return {
      _type: generateRelationshipType(
        RelationshipClass.ASSIGNED,
        bindingEntities.BINDINGS._type,
        targetType,
      ),
      sourceType: bindingEntities.BINDINGS._type,
      _class: RelationshipClass.ASSIGNED,
      targetType,
    };
  },
);

export const ROLE_TARGET_RELATIONSHIPS = IAM_TARGET_TYPES.map((targetType) => {
  return {
    _type: generateRelationshipType(
      RelationshipClass.ASSIGNED,
      IAM_ROLE_ENTITY_TYPE,
      targetType,
    ),
    sourceType: IAM_ROLE_ENTITY_TYPE,
    _class: RelationshipClass.ASSIGNED,
    targetType,
  };
});

export const bindingRelationships = {
  /**
   * IAM policies can target any resource in Google Cloud. Because we do not ingest every resource,
   * we have chosen, instead, to represent the relationship as IAM Binding assigned to ANY_RESOURCE.
   */
  BINDING_ASSIGNED_ANY_RESOURCE: {
    _type: generateRelationshipType(
      RelationshipClass.ASSIGNED,
      bindingEntities.BINDINGS._type,
      ANY_RESOURCE,
    ),
    sourceType: bindingEntities.BINDINGS._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: ANY_RESOURCE,
  },
};
