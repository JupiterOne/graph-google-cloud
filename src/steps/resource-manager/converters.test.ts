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
} from '../iam/converters';
import { Entity } from '@jupiterone/integration-sdk-core';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createIamUserAssignedIamRoleRelationship', () => {
  test('should convert to relationship using service account', () => {
    const serviceAccountEntity = createIamServiceAccountEntity(
      getMockServiceAccount({
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      }),
    );

    const roleEntity = createIamRoleEntity(getMockIamRole(), {
      custom: true,
    });

    expect(
      createIamUserAssignedIamRoleRelationship({
        iamUserEntity: serviceAccountEntity,
        iamRoleEntity: roleEntity,
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to relationship with conditions in role', () => {
    const serviceAccountEntity = createIamServiceAccountEntity(
      getMockServiceAccount({
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      }),
    );

    const roleEntity = createIamRoleEntity(getMockIamRole(), {
      custom: true,
    });

    expect(
      createIamUserAssignedIamRoleRelationship({
        iamUserEntity: serviceAccountEntity,
        iamRoleEntity: roleEntity,
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
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
      name: 'j1-gc-integration-dev-v2',
      'parent.type': 'organization',
      'parent.id': '158838481165',
      _key: 'j1-gc-integration-dev-v2',
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
            projectId: 'j1-gc-integration-dev-v2',
            lifecycleState: 'ACTIVE',
            name: 'j1-gc-integration-dev-v2',
            createTime: '2020-07-28T14:38:24.744Z',
            parent: { type: 'organization', id: '158838481165' },
          },
        },
      ],
      displayName: 'j1-gc-integration-dev-v2',
    };

    const mockProject = getMockProject();
    expect(
      createProjectEntity(mockProject.projectId as string, mockProject),
    ).toEqual(expected);
  });

  test('should convert entity with just projectId', () => {
    const expected: Entity = {
      name: 'j1-gc-integration-dev-v2',
      _key: 'j1-gc-integration-dev-v2',
      _type: 'google_cloud_project',
      _class: ['Account'],
      _rawData: [],
      displayName: 'j1-gc-integration-dev-v2',
    };

    const projectId = 'j1-gc-integration-dev-v2';
    expect(createProjectEntity(projectId, undefined)).toEqual(expected);
  });
});
