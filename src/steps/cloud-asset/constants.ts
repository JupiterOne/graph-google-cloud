import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { ANY_RESOURCE } from '../../constants';

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
  'google_domain',
  'google_iam_service_account',
  'google_group',
  'google_user',
];

const BINDING_TARGET_RELATIONSHIPS = IAM_TARGET_TYPES.map((targetType) => {
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
});

export const bindingRelationships = {
  ...BINDING_TARGET_RELATIONSHIPS,
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
