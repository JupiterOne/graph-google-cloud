import {
  ALL_AUTHENTICATED_USERS_TYPE,
  EVERYONE_TYPE,
  GOOGLE_DOMAIN_ENTITY_CLASS,
  GOOGLE_DOMAIN_ENTITY_TYPE,
  GOOGLE_GROUP_ENTITY_CLASS,
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_CLASS,
  GOOGLE_USER_ENTITY_TYPE,
  IAM_ROLE_ENTITY_CLASS,
  IAM_ROLE_ENTITY_TYPE,
  IAM_SERVICE_ACCOUNT_ENTITY_CLASS,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
} from '../iam';
import {
  ConvenienceMemberType,
  getRoleKeyFromConvienenceMember,
  ParsedIamMember,
  ParsedIamMemberType,
} from '../../utils/iam';
import {
  IntegrationError,
  PrimitiveEntity,
} from '@jupiterone/integration-sdk-core';

// https://github.com/JupiterOne/jupiter-integration-aws/blob/84c3685ba9f4d54a134b00ba553cbb84fffb9d19/src/util/everyone.ts#L1
function CreateIamAllUsers(_parsedMember: ParsedIamMember) {
  return {
    _class: ['UserGroup', 'Everyone'],
    _type: EVERYONE_TYPE,
    _key: 'global:everyone',
    public: true,
    displayName: 'Everyone (Public Global)',
  };
}

// https://github.com/JupiterOne/jupiter-integration-aws/blob/84c3685ba9f4d54a134b00ba553cbb84fffb9d19/src/util/everyone.ts#L10
function CreateIamAllAuthenticatedUsers(_parsedMember: ParsedIamMember) {
  return {
    _class: ['UserGroup', 'Everyone'],
    _type: ALL_AUTHENTICATED_USERS_TYPE,
    _key: 'global:google-cloud:authenticated-users',
    public: true,
    displayName: 'Everyone (All Google Cloud Authenticated Users)',
  };
}

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/domains/converters.ts#L6
function createIamDomain(parsedMember: ParsedIamMember) {
  const domainName = parsedMember.identifier;
  return {
    _key: domainName
      ? generateIamEntityKey(GOOGLE_DOMAIN_ENTITY_TYPE, domainName)
      : undefined,
    _type: GOOGLE_DOMAIN_ENTITY_TYPE,
    _class: GOOGLE_DOMAIN_ENTITY_CLASS,
    id: domainName,
    displayName: domainName,
    name: domainName,
    domainName,
  };
}

// https://github.com/JupiterOne/graph-google/blob/3e3d51e036d32f121374ae856cbdf5516711dc6d/src/steps/groups/converters.ts#L23
function createIamGroup(parsedMember: ParsedIamMember) {
  const email = parsedMember.identifier;
  const groupId = parsedMember.uniqueid;
  const deleted = parsedMember.deleted;
  return {
    _key: groupId
      ? generateIamEntityKey(GOOGLE_GROUP_ENTITY_TYPE, groupId)
      : undefined,
    _type: GOOGLE_GROUP_ENTITY_TYPE,
    _class: GOOGLE_GROUP_ENTITY_CLASS,
    id: groupId,
    email: email,
    deleted: deleted ?? false,
  };
}

function createIamRole(parsedMember: ParsedIamMember) {
  const projectId = parsedMember.identifier;
  const roleName = getRoleKeyFromConvienenceMember(
    parsedMember.type as ConvenienceMemberType,
  );
  const deleted = parsedMember.deleted;
  return {
    _class: IAM_ROLE_ENTITY_CLASS,
    _type: IAM_ROLE_ENTITY_TYPE,
    _key: roleName,
    name: roleName,
    displayName: roleName,
    deleted: deleted ?? false,
    projectId,
    custom: false,
  };
}

// https://github.com/JupiterOne/graph-google-cloud/blob/7b9af8f8193246fb8202ba7051da92d1f9f4b9be/src/steps/iam/converters.ts#L68
function createIamServiceAccount(parsedMember: ParsedIamMember) {
  const email = parsedMember.identifier;
  const serviceAccountId = parsedMember.uniqueid;
  const deleted = parsedMember.deleted;
  return {
    _class: IAM_SERVICE_ACCOUNT_ENTITY_CLASS,
    _type: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
    _key: email,
    id: serviceAccountId,
    username: email,
    email,
    deleted: deleted ?? false,
  };
}

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/users/converters.ts#L44
function createIamUser(parsedMember: ParsedIamMember) {
  const email = parsedMember.identifier;
  const userId = parsedMember.uniqueid;
  const deleted = parsedMember.deleted;
  return {
    _type: GOOGLE_USER_ENTITY_TYPE,
    _class: GOOGLE_USER_ENTITY_CLASS,
    _key: userId
      ? generateIamEntityKey(GOOGLE_USER_ENTITY_TYPE, userId)
      : undefined,
    id: userId,
    email: email,
    username: email ? getUsername(email) : undefined,
    deleted: deleted ?? false,
    emailDomain: email ? getDomain(email) : undefined,
  };
}

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/users/converters.ts#L161
function getUsername(email: string): string | null {
  const usernameMatch = /(.*?)@.*/.exec(email);
  return usernameMatch && usernameMatch[1];
}

function last<T>(arr: T[] | undefined): T | undefined {
  if (!arr || !arr.length) return undefined;
  return arr[arr.length - 1];
}

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/users/converters.ts#L166
function getDomain(email: string): string | undefined {
  return last(email.split('@'));
}

/**
 * Generates a `_key` value for iam entities owned by the google integration.
 * https://github.com/JupiterOne/graph-google
 *
 * https://github.com/JupiterOne/graph-google/blob/3e3d51e036d32f121374ae856cbdf5516711dc6d/src/utils/generateEntityKey.ts#L14
 */
function generateIamEntityKey(prefix: string, id: string | number) {
  if (!id) {
    throw new IntegrationError({
      code: 'UNDEFINED_KEY_ERROR',
      message: `Cannot generate a valid _key with ${JSON.stringify(id)}`,
    });
  }
  return `${prefix}_${id}`;
}

export const CREATE_IAM_ENTITY_MAP: {
  [K in ParsedIamMemberType]: (
    parsedMember: ParsedIamMember,
  ) => Partial<PrimitiveEntity>;
} = {
  ['domain']: createIamDomain,
  ['group']: createIamGroup,
  ['user']: createIamUser,
  ['serviceAccount']: createIamServiceAccount,
  ['allUsers']: CreateIamAllUsers,
  ['allAuthenticatedUsers']: CreateIamAllAuthenticatedUsers,
  // Google Storage buckets have extra "Convenience" members that need to be handled differently
  // https://cloud.google.com/storage/docs/access-control/iam#convenience-values
  ['projectEditor']: createIamRole,
  ['projectOwner']: createIamRole,
  ['projectViewer']: createIamRole,
};
