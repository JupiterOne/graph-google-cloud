import { iam_v1 } from 'googleapis';
import {
  createIntegrationEntity,
  getTime,
  Relationship,
  Entity,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import {
  IAM_ROLE_ENTITY_CLASS,
  IAM_ROLE_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_CLASS,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_CLASS,
  IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
  IAM_USER_ENTITY_CLASS,
  IAM_USER_ENTITY_TYPE,
} from './constants';
import { ParsedIamMemberType } from '../../utils/iam';

export function createIamRoleEntity(
  data: iam_v1.Schema$Role,
  {
    custom,
  }: {
    /**
     * Google Cloud has managed roles and custom roles. There is no metadata
     * on the role itself that marks whether it's a custom role or managed role.
     * We mark explcitly fetched custom rules as custom.
     */
    custom: boolean;
  },
) {
  const roleName = data.name as string;

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: IAM_ROLE_ENTITY_CLASS,
        _type: IAM_ROLE_ENTITY_TYPE,
        _key: roleName,
        name: roleName,
        displayName: data.title as string,
        description: data.description,
        stage: data.stage,
        custom: custom === true,
        deleted: data.deleted === true,
        permissions: data.includedPermissions,
        etag: data.etag,
      },
    },
  });
}

function getServiceAccountWebLink({
  projectId,
  serviceAccountId,
}: {
  projectId: string;
  serviceAccountId: string;
}) {
  return `https://console.cloud.google.com/iam-admin/serviceaccounts/details/${serviceAccountId}?orgonly=true&project=${projectId}&supportedpurview=organizationId`;
}

export function createIamUserEntity(data: {
  type: ParsedIamMemberType;
  identifier: string;
  uniqueid: string | undefined;
  deleted: boolean;
}) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: IAM_USER_ENTITY_CLASS,
        _type: IAM_USER_ENTITY_TYPE,
        _key: data.identifier,
        displayName: data.identifier,
        name: data.identifier,
        username: data.identifier,
        type: data.type,
        deleted: data.deleted,
        uniqueid: data.uniqueid,
      },
    },
  });
}

export function createIamServiceAccountEntity(
  data: iam_v1.Schema$ServiceAccount,
) {
  const serviceAccountId = data.uniqueId as string;
  const projectId = data.projectId as string;

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: IAM_SERVICE_ACCOUNT_ENTITY_CLASS,
        _type: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
        _key: data.email as string,
        name: data.name,
        displayName: (data.displayName || data.name) as string,
        id: serviceAccountId,
        projectId,
        oauth2ClientId: data.oauth2ClientId,
        username: data.email,
        email: data.email,
        enabled: data.disabled !== true,
        description: data.description,
        etag: data.etag,
        webLink: getServiceAccountWebLink({
          serviceAccountId,
          projectId,
        }),
      },
    },
  });
}

export function createIamServiceAccountKeyEntity(
  data: iam_v1.Schema$ServiceAccountKey,
  {
    serviceAccountId,
    projectId,
  }: {
    serviceAccountId: string;
    projectId: string;
  },
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: IAM_SERVICE_ACCOUNT_KEY_ENTITY_CLASS,
        _type: IAM_SERVICE_ACCOUNT_KEY_ENTITY_TYPE,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        origin: data.keyOrigin,
        type: data.keyType,
        algorithm: data.keyAlgorithm,
        createdOn: getTime(data.validAfterTime),
        expiresOn: getTime(data.validBeforeTime),
        webLink: getServiceAccountWebLink({
          serviceAccountId,
          projectId,
        }),
      },
    },
  });
}

export function createIamServiceAccountHasKeyRelationship(params: {
  serviceAccountEntity: Entity;
  serviceAccountKeyEntity: Entity;
}): Relationship {
  return createDirectRelationship({
    _class: 'HAS',
    from: params.serviceAccountEntity,
    to: params.serviceAccountKeyEntity,
    properties: {
      webLink: params.serviceAccountEntity.webLink,
    },
  });
}
