import {
  GOOGLE_DOMAIN_ENTITY_CLASS,
  GOOGLE_DOMAIN_ENTITY_TYPE,
  GOOGLE_GROUP_ENTITY_CLASS,
  GOOGLE_GROUP_ENTITY_TYPE,
  GOOGLE_USER_ENTITY_CLASS,
  GOOGLE_USER_ENTITY_TYPE,
  IAM_PRINCIPAL_TYPE,
} from '../iam';
import {
  IntegrationError,
  PrimitiveEntity,
} from '@jupiterone/integration-sdk-core';
import { IamUserEntityWithParsedMember } from '.';
import { last } from 'lodash';

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/domains/converters.ts#L6
function createIamDomain(
  iamUserEntityWithParsedMember: IamUserEntityWithParsedMember,
) {
  const domainName = iamUserEntityWithParsedMember.parsedMember.identifier!;
  return {
    _key: generateIamEntityKey(GOOGLE_DOMAIN_ENTITY_TYPE, domainName),
    _type: GOOGLE_DOMAIN_ENTITY_TYPE,
    _class: GOOGLE_DOMAIN_ENTITY_CLASS,
    id: domainName,
    displayName: domainName,
    name: domainName,
    domainName,
  };
}

// https://github.com/JupiterOne/graph-google/blob/3e3d51e036d32f121374ae856cbdf5516711dc6d/src/steps/groups/converters.ts#L23
function createIamGroup(
  iamUserEntityWithParsedMember: IamUserEntityWithParsedMember,
) {
  const email = iamUserEntityWithParsedMember.parsedMember.identifier!;
  const groupId = iamUserEntityWithParsedMember.parsedMember.uniqueid!;
  return {
    _key: groupId
      ? generateIamEntityKey(GOOGLE_GROUP_ENTITY_TYPE, groupId)
      : undefined,
    _type: GOOGLE_GROUP_ENTITY_TYPE,
    _class: GOOGLE_GROUP_ENTITY_CLASS,
    id: groupId,
    email: email,
    // // We do not have access to the group name which makes the entities look incomplete
    // name: undefined,
    // displayName: undefined,
  };
}

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/users/converters.ts#L44
function createIamUser(
  iamUserEntityWithParsedMember: IamUserEntityWithParsedMember,
) {
  const email = iamUserEntityWithParsedMember.parsedMember.identifier!;
  const userId = iamUserEntityWithParsedMember.parsedMember.uniqueid!;
  const user: {
    _key?: string;
    _type: string;
    _class: string;
    id?: string;
    email: string;
    domainName?: string | null;
    username: string | null;
    deleted: boolean;
  } = {
    _type: GOOGLE_USER_ENTITY_TYPE,
    _class: GOOGLE_USER_ENTITY_CLASS,
    email: email,
    domainName: email ? getDomain(email) : undefined,
    username: getUsername(email),
    deleted: false,
    // // We do not have access to the user's name which makes the entities look incomplete
    // name: undefined,
    // displayName: undefined,
  };
  if (userId) {
    // the _key will not be defined when the userId is not used when making the google_iam_binding
    user._key = generateIamEntityKey(GOOGLE_USER_ENTITY_TYPE, userId);
    user.id = userId;
  }
  return user;
}

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/users/converters.ts#L159
function getUsername(email: string): string | null {
  const usernameMatch = /(.*?)@.*/.exec(email);
  return usernameMatch && usernameMatch[1];
}

// https://github.com/JupiterOne/graph-google/blob/ad4d88d0151cd7dc4ad93dc30d1aa40e6c97778e/src/steps/users/converters.ts#L166
function getDomain(email: string): string | null {
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
  [key in IAM_PRINCIPAL_TYPE]: (
    iamUserEntityWithParsedMember: IamUserEntityWithParsedMember,
  ) => Partial<PrimitiveEntity>;
} = {
  [GOOGLE_DOMAIN_ENTITY_TYPE]: createIamDomain,
  [GOOGLE_GROUP_ENTITY_TYPE]: createIamGroup,
  [GOOGLE_USER_ENTITY_TYPE]: createIamUser,
};
