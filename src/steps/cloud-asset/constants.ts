import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { ANY_RESOURCE } from '../../constants';
import {
  ALL_AUTHENTICATED_USERS_TYPE,
  EVERYONE_TYPE,
  GOOGLE_DOMAIN_ENTITY_TYPE,
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_TYPE,
  IAM_ROLE_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
} from '../iam';
import { API_SERVICE_ENTITY_TYPE } from '../service-usage';

export const STEP_IAM_BINDINGS = 'fetch-iam-bindings';
export const STEP_CREATE_BASIC_ROLES = 'create-basic-roles';
export const STEP_CREATE_BINDING_PRINCIPAL_RELATIONSHIPS =
  'create-binding-principal-relationships';
export const STEP_CREATE_BINDING_ROLE_RELATIONSHIPS =
  'create-binding-role-relationships';
export const STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS =
  'create-binding-any-resource-relationships';
export const STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS =
  'create-api-service-any-resource-relationships';

export const bindingEntities = {
  BINDINGS: {
    _type: 'google_iam_binding',
    _class: ['AccessPolicy'], // Technically not a policy, but functions just like one. IAM Policies are groups of IAM bindings.
    resourceName: 'IAM Binding',
  },
};

const IAM_PRINCIPAL_TYPES = [
  GOOGLE_DOMAIN_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_TYPE,
  ALL_AUTHENTICATED_USERS_TYPE,
  EVERYONE_TYPE,
  IAM_ROLE_ENTITY_TYPE, // bindings can have roles as principals for "convienence members"
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

/**
 * IAM policies can target any resource in Google Cloud. Because we do not ingest every resource,
 * we have chosen, instead, to represent the relationship as IAM Binding assigned to ANY_RESOURCE.
 */
export const BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIP = {
  _type: generateRelationshipType(
    RelationshipClass.ALLOWS,
    bindingEntities.BINDINGS._type,
    ANY_RESOURCE,
  ),
  sourceType: bindingEntities.BINDINGS._type,
  _class: RelationshipClass.ALLOWS,
  targetType: ANY_RESOURCE,
};

export const API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIP = {
  _class: RelationshipClass.HAS,
  _type: generateRelationshipType(
    RelationshipClass.HAS,
    API_SERVICE_ENTITY_TYPE,
    ANY_RESOURCE,
  ),
  sourceType: API_SERVICE_ENTITY_TYPE,
  targetType: ANY_RESOURCE,
};
