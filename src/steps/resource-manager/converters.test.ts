import {
  createIamServiceAccountAssignedIamRoleRelationship,
  createOrganizationEntity,
  createProjectEntity,
} from './converters';
import {
  getMockIamRole,
  getMockServiceAccount,
  getMockProject,
  getMockOrganization,
} from '../../../test/mocks';
import {
  createIamRoleEntity,
  createIamServiceAccountEntity,
} from '../iam/converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createIamServiceAccountAssignedIamRoleRelationship', () => {
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
      createIamServiceAccountAssignedIamRoleRelationship({
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
      createIamServiceAccountAssignedIamRoleRelationship({
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
    expect(
      createProjectEntity(
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        getMockProject(),
      ),
    ).toMatchSnapshot();
  });

  test('should convert entity with just projectId', () => {
    expect(
      createProjectEntity(DEFAULT_INTEGRATION_CONFIG_PROJECT_ID, undefined),
    ).toMatchSnapshot();
  });
});

describe('#createOrganizationEntity', () => {
  test('should convert to entity', () => {
    expect(createOrganizationEntity(getMockOrganization())).toMatchSnapshot();
  });
});
