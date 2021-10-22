import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { MULTIPLE_J1_TYPES_FOR_RESOURCE_KIND } from '../../utils/iamBindings/resourceKindToTypeMap';
import { J1_TYPE_TO_KEY_GENERATOR_MAP } from '../../utils/iamBindings/typeToKeyGeneratorMap';
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
import {
  SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
  SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
} from '../sql-admin';

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
      indexMetadata: {
        enabled: false,
      },
    };
  },
);

const bindingResourceTargetTypes = Object.keys(J1_TYPE_TO_KEY_GENERATOR_MAP)
  .filter((type) => type != MULTIPLE_J1_TYPES_FOR_RESOURCE_KIND)
  .concat([
    SQL_ADMIN_MYSQL_INSTANCE_ENTITY_TYPE,
    SQL_ADMIN_POSTGRES_INSTANCE_ENTITY_TYPE,
    SQL_ADMIN_SQL_SERVER_INSTANCE_ENTITY_TYPE,
  ]);

/**
 * IAM policies can target any resource in Google Cloud. Because we do not ingest every resource,
 * we have chosen, instead, to represent the relationship as IAM Binding assigned to ANY_RESOURCE.
 */
export const BINDING_ALLOWS_ANY_RESOURCE_RELATIONSHIPS =
  bindingResourceTargetTypes.map((resourceType) => {
    return {
      _type: generateRelationshipType(
        RelationshipClass.ALLOWS,
        bindingEntities.BINDINGS._type,
        resourceType,
      ),
      sourceType: bindingEntities.BINDINGS._type,
      _class: RelationshipClass.ALLOWS,
      targetType: resourceType,
      indexMetadata: {
        enabled: false,
      },
    };
  });

export const API_SERVICE_HAS_ANY_RESOURCE_RELATIONSHIPS =
  bindingResourceTargetTypes.map((resourceType) => {
    return {
      _class: RelationshipClass.HAS,
      _type: generateRelationshipType(
        RelationshipClass.HAS,
        API_SERVICE_ENTITY_TYPE,
        resourceType,
      ),
      sourceType: API_SERVICE_ENTITY_TYPE,
      targetType: resourceType,
      indexMetadata: {
        enabled: false,
      },
    };
  });
