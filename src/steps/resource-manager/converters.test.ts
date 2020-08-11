import { createIamUserImplementsIamRoleRelationship } from './converters';
import { getMockIamRole, getMockServiceAccount } from '../../../test/mocks';
import {
  createIamRoleEntity,
  createIamServiceAccountEntity,
  createIamUserEntity,
} from '../iam/converters';

describe('#createIamUserImplementsIamRoleRelationship', () => {
  test('should convert to relationship using service account', () => {
    const projectId = 'abc123';
    const serviceAccountEntity = createIamServiceAccountEntity(
      getMockServiceAccount({
        projectId,
      }),
    );

    const roleEntity = createIamRoleEntity(getMockIamRole(), {
      custom: true,
      projectId,
    });

    expect(
      createIamUserImplementsIamRoleRelationship({
        iamUserEntity: serviceAccountEntity,
        iamRoleEntity: roleEntity,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to relationship using user', () => {
    const projectId = 'abc123';
    const userEntity = createIamUserEntity({
      projectId: 'abc123',
      type: 'user',
      identifier: 'test.user@example.com',
      uniqueid: undefined,
      deleted: false,
    });

    const roleEntity = createIamRoleEntity(getMockIamRole(), {
      custom: true,
      projectId,
    });

    expect(
      createIamUserImplementsIamRoleRelationship({
        iamUserEntity: userEntity,
        iamRoleEntity: roleEntity,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to relationship with conditions in role', () => {
    const projectId = 'abc123';
    const serviceAccountEntity = createIamServiceAccountEntity(
      getMockServiceAccount({
        projectId,
      }),
    );

    const roleEntity = createIamRoleEntity(getMockIamRole(), {
      custom: true,
      projectId,
    });

    expect(
      createIamUserImplementsIamRoleRelationship({
        iamUserEntity: serviceAccountEntity,
        iamRoleEntity: roleEntity,
        condition: {
          title: 'Test title',
          description: 'Test description',
          expression: 'resource.name != "bogusunknownresourcename"',
        },
      }),
    ).toMatchSnapshot();
  });
});
