import { parseIamMember } from './iam';
import { IntegrationError } from '@jupiterone/integration-sdk-core';

describe('#parseIamMember', () => {
  test('should parse `allUsers` format', () => {
    expect(parseIamMember('allUsers')).toEqual({
      type: 'allUsers',
      identifier: undefined,
      uniqueid: undefined,
      deleted: false,
    });
  });

  test('should parse `allAuthenticatedUsers` format', () => {
    expect(parseIamMember('allAuthenticatedUsers')).toEqual({
      type: 'allAuthenticatedUsers',
      identifier: undefined,
      uniqueid: undefined,
      deleted: false,
    });
  });

  test('should parse `user:{emailid}` format', () => {
    expect(parseIamMember('user:test.user@example.com')).toEqual({
      type: 'user',
      identifier: 'test.user@example.com',
      uniqueid: undefined,
      deleted: false,
    });
  });

  test('should parse `serviceAccount:{emailid}` format', () => {
    expect(parseIamMember('serviceAccount:test.user@example.com')).toEqual({
      type: 'serviceAccount',
      identifier: 'test.user@example.com',
      uniqueid: undefined,
      deleted: false,
    });
  });

  test('should parse `group:{emailid}` format', () => {
    expect(parseIamMember('group:admins@example.com')).toEqual({
      type: 'group',
      identifier: 'admins@example.com',
      uniqueid: undefined,
      deleted: false,
    });
  });

  test('should parse `deleted:user:{emailid}?uid={uniqueid}` format', () => {
    expect(
      parseIamMember('deleted:user:test.user@example.com?uid=12345'),
    ).toEqual({
      type: 'user',
      identifier: 'test.user@example.com',
      uniqueid: '12345',
      deleted: true,
    });
  });

  test('should parse `deleted:serviceAccount:{emailid}?uid={uniqueid}` format', () => {
    expect(
      parseIamMember('deleted:serviceAccount:test.user@example.com?uid=12345'),
    ).toEqual({
      type: 'serviceAccount',
      identifier: 'test.user@example.com',
      uniqueid: '12345',
      deleted: true,
    });
  });

  test('should parse `deleted:group:{emailid}?uid={uniqueid}` format', () => {
    expect(
      parseIamMember('deleted:group:admins@example.com?uid=12345'),
    ).toEqual({
      type: 'group',
      identifier: 'admins@example.com',
      uniqueid: '12345',
      deleted: true,
    });
  });

  test('should parse `domain:{domain}` format', () => {
    expect(parseIamMember('domain:example.com')).toEqual({
      type: 'domain',
      identifier: 'example.com',
      uniqueid: undefined,
      deleted: false,
    });
  });

  test('should fail to parse `deleted:serviceAccount:?uid={uniqueid}` (no email)', () => {
    expect.assertions(3);

    try {
      parseIamMember('deleted:serviceAccount:?uid=12345');
    } catch (err) {
      expect(err instanceof IntegrationError).toEqual(true);
      expect(err.message).toEqual(
        'parseMemberIdentifyingData cannot process this member format.',
      );
      expect(err.code).toEqual('UNPROCESSABLE_PARTIAL_IAM_MEMBER_FORMAT');
    }
  });

  test('should fail to parse `deleted:serviceAccount:{emailid}` (no querystring)', () => {
    expect.assertions(3);

    try {
      parseIamMember('deleted:serviceAccount:test.user@example.com');
    } catch (err) {
      expect(err instanceof IntegrationError).toEqual(true);
      expect(err.message).toEqual(
        'parseMemberIdentifyingData cannot process this member format.',
      );
      expect(err.code).toEqual('UNPROCESSABLE_PARTIAL_IAM_MEMBER_FORMAT');
    }
  });

  test('should fail to parse unknown member format', () => {
    expect.assertions(3);

    try {
      parseIamMember('UNKNOWN');
    } catch (err) {
      expect(err instanceof IntegrationError).toEqual(true);
      expect(err.message).toEqual(
        'getIamMemberDataFromIamMember cannot process this member format.',
      );
      expect(err.code).toEqual('UNPROCESSABLE_IAM_MEMBER_FORMAT');
    }
  });
});
