import {
  createIamRoleEntity,
  createIamServiceAccountEntity,
  createIamServiceAccountKeyEntity,
  createIamServiceAccountHasKeyRelationship,
} from './converters';
import {
  getMockIamRole,
  getMockServiceAccount,
  getMockServiceAccountKey,
} from '../../../test/mocks';

describe('#createIamRoleEntity', () => {
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

describe('#createIamServiceAccount', () => {
  test('should convert to entity', () => {
    expect(
      createIamServiceAccountEntity(getMockServiceAccount()),
    ).toMatchSnapshot();
  });

  test('should convert to entity with "enabled" set to "false" if "disabled" is "true"', () => {
    expect(
      createIamServiceAccountEntity(
        getMockServiceAccount({
          disabled: true,
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createIamServiceAccountKeyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createIamServiceAccountKeyEntity(getMockServiceAccountKey(), {
        projectId: 'j1-gc-integration-dev-v2',
        serviceAccountId: 'abc123',
      }),
    ).toMatchSnapshot();
  });
});

describe('#createIamServiceAccountHasKeyRelationship', () => {
  test('should convert to relationship', () => {
    const serviceAccountEntity = createIamServiceAccountEntity(
      getMockServiceAccount(),
    );

    const serviceAccountKeyEntity = createIamServiceAccountKeyEntity(
      getMockServiceAccountKey(),
      {
        projectId: 'j1-gc-integration-dev-v2',
        serviceAccountId: 'abc123',
      },
    );

    expect(
      createIamServiceAccountHasKeyRelationship({
        serviceAccountEntity,
        serviceAccountKeyEntity,
      }),
    ).toMatchSnapshot();
  });
});
