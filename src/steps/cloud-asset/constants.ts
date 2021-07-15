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

const IAM_PRINCIPAL_TYPES = [
  // 'google_domain', // These are getting ignored for now
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_TYPE,
];

export const BINDING_ASSIGNED_PRINCIPAL_RELATIONSHIPS = IAM_PRINCIPAL_TYPES.map(
  (principalType) => {
    return {
      _type: generateRelationshipType(
        RelationshipClass.ASSIGNED,
        bindingEntities.BINDINGS._type,
        principalType,
      ),
      sourceType: bindingEntities.BINDINGS._type,
      _class: RelationshipClass.ASSIGNED,
      targetType: principalType,
    };
  },
);

export const PRINCIPAL_ASSIGNED_ROLE_RELATIONSHIPS = IAM_PRINCIPAL_TYPES.map(
  (principalType) => {
    return {
      _type: generateRelationshipType(
        RelationshipClass.ASSIGNED,
        principalType,
        IAM_ROLE_ENTITY_TYPE,
      ),
      sourceType: principalType,
      _class: RelationshipClass.ASSIGNED,
      targetType: IAM_ROLE_ENTITY_TYPE,
    };
  },
);

/**
 * IAM policies can target any resource in Google Cloud. Because we do not ingest every resource,
 * we have chosen, instead, to represent the relationship as IAM Binding assigned to ANY_RESOURCE.
 */
export const BINDING_ASSIGNED_ANY_RESOURCE_RELATIONSHIP = {
  _type: generateRelationshipType(
    RelationshipClass.ASSIGNED,
    bindingEntities.BINDINGS._type,
    ANY_RESOURCE,
  ),
  sourceType: bindingEntities.BINDINGS._type,
  _class: RelationshipClass.ASSIGNED,
  targetType: ANY_RESOURCE,
};
