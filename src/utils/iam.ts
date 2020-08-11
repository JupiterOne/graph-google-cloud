import * as url from 'url';
import * as querystring from 'querystring';
import { IntegrationError } from '@jupiterone/integration-sdk-core';

/**
 * Some IAM members resemble this format: `deleted:serviceAccount:{emailid}?uid={uniqueid}`
 *
 * We want to extract the user identifier, in this case {emailid} as well as
 * the {uniqueid} from the query.
 *
 * @param partialMember - Partial member in the following format: {emailid}?uid={uniqueid}
 */
function parseMemberIdentifyingData(partialMember: string) {
  const { pathname, query } = url.parse(partialMember);

  if (!pathname || !query) {
    // The format of the member data is one that we do not know how to handle.
    // This should never happen.
    throw new IntegrationError({
      message: 'parseMemberIdentifyingData cannot process this member format.',
      code: 'UNPROCESSABLE_PARTIAL_IAM_MEMBER_FORMAT',
    });
  }

  const { uid } = querystring.parse(query);

  return {
    identifier: pathname,
    uniqueid: uid as string | undefined,
  };
}

export type ParsedIamMemberType =
  | 'allUsers'
  | 'allAuthenticatedUsers'
  | 'user'
  | 'serviceAccount'
  | 'group'
  | 'domain';

export interface ParsedIamMember {
  type: ParsedIamMemberType;
  identifier: string | undefined;
  uniqueid: string | undefined;
  deleted: boolean;
}

/**
 * Parses the IAM member and returns relevant metadata
 *
 * Ex.
 *
 * Input: serviceAccount:my-other-app@appspot.gserviceaccount.com
 * Output:
 *
 * {
 *   type: 'serviceAccount',
 *   identifier: 'my-other-app@appspot.gserviceaccount.com'
 * }
 *
 * IAM member type notes:
 *
 * Specifies the identities requesting access for a Cloud Platform resource.
 * `members` can have the following values:
 *
 * -  `allUsers`: A special identifier that represents anyone who is on the
 *    internet; with or without a Google account.
 *
 * - `allAuthenticatedUsers`: A special identifier that represents anyone who is
 *    authenticated with a Google account or a service account.
 *
 * - `user:{emailid}`: An email address that represents a specific Google
 *    account. For example, `alice@example.com`.
 *
 * - `serviceAccount:{emailid}`: An email address that represents a service
 *    account. For example, `my-other-app@appspot.gserviceaccount.com`.
 *
 * - `group:{emailid}`: An email address that represents a Google group.
 *    For example, `admins@example.com`.
 *
 * - `deleted:user:{emailid}?uid={uniqueid}`: An email address (plus unique identifier)
 *    representing a user that has been recently deleted.
 *    For example, `alice@example.com?uid=123456789012345678901`. If the user is
 *    recovered, this value reverts to `user:{emailid}` and the recovered user
 *    retains the role in the binding.
 *
 * - `deleted:serviceAccount:{emailid}?uid={uniqueid}`: An email address (plus unique identifier)
 *    representing a service account that has been recently deleted. For example,
 *    `my-other-app@appspot.gserviceaccount.com?uid=123456789012345678901`.
 *    If the service account is undeleted, this value reverts to `serviceAccount:{emailid}`
 *    and the undeleted service account retains the
 *    role in the binding.
 *
 * - `deleted:group:{emailid}?uid={uniqueid}`: An email address (plus unique identifier)
 *   representing a Google group that has been recently deleted.
 *
 *   For example, `admins@example.com?uid=123456789012345678901`. If the group
 *   is recovered, this value reverts to `group:{emailid}` and the recovered
 *   group retains the role in the binding.
 *
 * - `domain:{domain}`: The G Suite domain (primary) that represents all the
 *   users of that domain. For example, `google.com` or `example.com`.
 *
 * @param member - A member listed in a IAM role policy (See: https://cloud.google.com/iam/docs/overview#cloud-iam-policy)
 */
export function parseIamMember(member: string): ParsedIamMember {
  if (member === 'allUsers' || member === 'allAuthenticatedUsers') {
    return {
      type: member,
      identifier: undefined,
      uniqueid: undefined,
      deleted: false,
    };
  }

  const data = member.split(':');

  if (data.length === 1) {
    // The format of the member data is one that we do not know how to handle.
    // This should never happen.
    throw new IntegrationError({
      message:
        'getIamMemberDataFromIamMember cannot process this member format.',
      code: 'UNPROCESSABLE_IAM_MEMBER_FORMAT',
    });
  }

  const deleted = data[0] === 'deleted';
  let type: ParsedIamMemberType;

  let identifier: string;
  let uniqueid: string | undefined;

  if (deleted) {
    // Example: `deleted:serviceAccount:{emailid}?uid={uniqueid}`
    type = data[1] as ParsedIamMemberType;
    ({ identifier, uniqueid } = parseMemberIdentifyingData(data[2]));
  } else {
    // Example: `serviceAccount:{emailid}`
    type = data[0] as ParsedIamMemberType;
    identifier = data[1];
  }

  return {
    type,
    identifier,
    uniqueid,
    deleted,
  };
}
