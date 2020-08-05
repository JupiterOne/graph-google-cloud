import { iam_v1 } from 'googleapis';
import { createIamRoleEntity } from './converters';

function getMockIamRole(
  partial?: Partial<iam_v1.Schema$Role>,
): iam_v1.Schema$Role {
  return {
    name: 'projects/j1-gc-integration-dev/roles/myrole',
    title: 'Role',
    description: 'Description',
    includedPermissions: [
      'cloudfunctions.functions.get',
      'cloudfunctions.functions.getIamPolicy',
    ],
    stage: 'GA',
    etag: 'abc123',
    ...partial,
  };
}

describe('#createCloudFunctionEntity', () => {
  test('should convert custom role to entity', () => {
    expect(
      createIamRoleEntity(getMockIamRole(), {
        custom: true,
      }),
    ).toMatchSnapshot();
  });

  test('should convert noncustom role to entity', () => {
    expect(
      createIamRoleEntity(getMockIamRole(), {
        custom: false,
      }),
    ).toMatchSnapshot();
  });
});
