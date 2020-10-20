import {
  createIamUserAssignedIamRoleRelationship,
  createProjectEntity,
} from './converters';
import {
  getMockIamRole,
  getMockServiceAccount,
  getMockProject,
} from '../../../test/mocks';
import {
  createIamRoleEntity,
  createIamServiceAccountEntity,
  createIamUserEntity,
} from '../iam/converters';
import { Entity } from '@jupiterone/integration-sdk-core';

describe('#createIamUserAssignedIamRoleRelationship', () => {
  test('should convert to relationship using service account', () => {
    const projectId = 'abc123';
    const serviceAccountEntity = createIamServiceAccountEntity(
      getMockServiceAccount({
        projectId,
      }),
    );

    const roleEntity = createIamRoleEntity(getMockIamRole(), {
      custom: true,
    });

    expect(
      createIamUserAssignedIamRoleRelationship({
        iamUserEntity: serviceAccountEntity,
        iamRoleEntity: roleEntity,
        projectId,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to relationship using user', () => {
    const projectId = 'abc123';

    const userEntity = createIamUserEntity({
      type: 'user',
      identifier: 'test.user@example.com',
      uniqueid: undefined,
      deleted: false,
    });

    const roleEntity = createIamRoleEntity(getMockIamRole(), {
      custom: true,
    });

    expect(
      createIamUserAssignedIamRoleRelationship({
        iamUserEntity: userEntity,
        iamRoleEntity: roleEntity,
        projectId,
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
    });

    expect(
      createIamUserAssignedIamRoleRelationship({
        iamUserEntity: serviceAccountEntity,
        iamRoleEntity: roleEntity,
        projectId,
        condition: {
          title: 'Test title',
          description: 'Test description',
          expression: 'resource.name != "bogusunknownresourcename"',
        },
      }),
    ).toMatchSnapshot();
  });
});

describe('#createProjectEntity', () => {
  test('should convert entity', () => {
    const expected: Entity = {
      name: 'j1-gc-integration-dev',
      'parent.type': 'organization',
      'parent.id': '158838481165',
      _key: 'j1-gc-integration-dev',
      _type: 'google_cloud_project',
      _class: ['Account'],
      projectNumber: '545240943112',
      lifecycleState: 'ACTIVE',
      createdOn: 1595947104744,
      _rawData: [
        {
          name: 'default',
          rawData: {
            projectNumber: '545240943112',
            projectId: 'j1-gc-integration-dev',
            lifecycleState: 'ACTIVE',
            name: 'j1-gc-integration-dev',
            createTime: '2020-07-28T14:38:24.744Z',
            parent: { type: 'organization', id: '158838481165' },
          },
        },
      ],
      displayName: 'j1-gc-integration-dev',
    };

    expect(createProjectEntity(getMockProject())).toEqual(expected);
  });
});
