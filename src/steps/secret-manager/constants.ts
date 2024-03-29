import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const SecretManagerSteps = {
  FETCH_SECRETS: {
    id: 'fetch-secrets',
    name: 'Fetch Secret Manager secrets',
  },
  FETCH_SECRET_VERSIONS: {
    id: 'fetch-secret-versions',
    name: 'Fetch Secret Manager secret versions',
  },
};

export const SecretManagerEntities = {
  SECRET: {
    resourceName: 'Secret',
    _type: 'google_secret_manager_secret',
    _class: ['Group'],
  },
  SECRET_VERSION: {
    resourceName: 'Secret Version',
    _type: 'google_secret_manager_secret_version',
    _class: ['Secret'],
  },
};

export const SecretManagerRelationships = {
  SECRET_HAS_VERSION: {
    _type: 'google_secret_manager_secret_has_version',
    sourceType: SecretManagerEntities.SECRET._type,
    _class: RelationshipClass.HAS,
    targetType: SecretManagerEntities.SECRET_VERSION._type,
  },
};

export const IngestionSources = {
  SECRET_MANAGER_SECRETS: 'secret-manager-secrets',
  SECRET_MANAGER_SECRET_VERSIONS: 'secret-manager-secret-versions',
};

export const SecretManagerIngestionConfig = {
  [IngestionSources.SECRET_MANAGER_SECRETS]: {
    title: 'Google Secret Manager Secrets',
    description: 'Manage sensitive data securely.',
    defaultsToDisabled: false,
  },
  [IngestionSources.SECRET_MANAGER_SECRET_VERSIONS]: {
    title: 'Google Secret Manager Versions',
    description: 'Versioning for managed secrets.',
    defaultsToDisabled: false,
  },
};

export const SecretManagerPermissions = {
  FETCH_SECRETS: ['secretmanager.secrets.list'],
  FETCH_SECRET_VERSIONS: ['secretmanager.versions.list'],
};
