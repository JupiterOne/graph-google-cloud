import {
  getFullServiceApiNameFromPermission,
  getRoleKeyFromConvienenceMember,
  getUniqueFullServiceApiNamesFromRole,
  isReadOnlyPermission,
  isReadOnlyRole,
  parseIamMember,
} from './iam';
import { IntegrationError } from '@jupiterone/integration-sdk-core';
import { getMockIamRole } from '../../test/mocks';

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
      expect(err.code).toEqual('UNKNOWN_IAM_MEMBER_FORMAT');
    }
  });
});

describe('#isReadOnlyPermission', () => {
  // Some of the permissions that this will generate are bogus, but it will
  // demonstrate all of the legitimate cases
  for (const action of ['get', 'list', 'export', 'view', 'check', 'read']) {
    test(`should return true when permission action is "${action}"`, () => {
      expect(
        isReadOnlyPermission(
          `binaryauthorization.continuousValidationConfig.${action}`,
        ),
      ).toEqual(true);
    });

    test(`should return true when permission action starts with "${action}"`, () => {
      expect(
        isReadOnlyPermission(
          `binaryauthorization.continuousValidationConfig.${action}All`,
        ),
      ).toEqual(true);
    });
  }

  test('should return true when permission action is "group"', () => {
    expect(isReadOnlyPermission('securitycenter.findings.group')).toEqual(true);
  });

  test('should return false when permission action is not read-only', () => {
    expect(isReadOnlyPermission('storage.buckets.delete')).toEqual(false);
  });
});

describe('#isReadOnlyRole', () => {
  test('should return true when role permissions property is undefined', () => {
    expect(
      isReadOnlyRole(
        getMockIamRole({
          includedPermissions: undefined,
        }),
      ),
    ).toEqual(true);
  });

  test('should return true when role has no permissions', () => {
    expect(
      isReadOnlyRole(
        getMockIamRole({
          includedPermissions: [],
        }),
      ),
    ).toEqual(true);
  });

  test('should return true when role only has read-only permissions', () => {
    expect(
      isReadOnlyRole(
        getMockIamRole({
          includedPermissions: [
            'binaryauthorization.continuousValidationConfig.get',
            'binaryauthorization.continuousValidationConfig.list',
          ],
        }),
      ),
    ).toEqual(true);
  });

  test('should return false when role is not read-only', () => {
    expect(
      isReadOnlyRole(
        getMockIamRole({
          includedPermissions: [
            'binaryauthorization.continuousValidationConfig.get',
            'storage.buckets.delete',
            'binaryauthorization.continuousValidationConfig.list',
          ],
        }),
      ),
    ).toEqual(false);
  });
});

describe('#getFullServiceApiNameFromPermission', () => {
  test('should convert full service API name from permission', () => {
    expect(
      getFullServiceApiNameFromPermission(
        'binaryauthorization.attestors.update',
      ),
    ).toEqual('binaryauthorization.googleapis.com');
  });

  test('should consider API naming conversion map when converting full service API name from permission', () => {
    expect(
      getFullServiceApiNameFromPermission('resourcemanager.projects.get'),
    ).toEqual('cloudresourcemanager.googleapis.com');
  });
});

describe('#getUniqueFullServiceApiNamesFromRole', () => {
  test('should generate unique set service API names from permission', () => {
    expect(
      getUniqueFullServiceApiNamesFromRole([
        'binaryauthorization.policy.get',
        'resourcemanager.projects.get',
        'bigtable.tables.delete',
        'binaryauthorization.attestors.update',
      ]),
    ).toEqual([
      'binaryauthorization.googleapis.com',
      'cloudresourcemanager.googleapis.com',
      'bigtable.googleapis.com',
    ]);
  });
});

describe('getRoleKeyFromConvienenceType', () => {
  it('should parse projectEditor correctly', () => {
    expect(getRoleKeyFromConvienenceMember('projectEditor')).toBe(
      'roles/editor',
    );
  });
  it('should parse projectOwner correctly', () => {
    expect(getRoleKeyFromConvienenceMember('projectOwner')).toBe('roles/owner');
  });
  it('should parse projectViewer correctly', () => {
    expect(getRoleKeyFromConvienenceMember('projectViewer')).toBe(
      'roles/viewer',
    );
  });
});
