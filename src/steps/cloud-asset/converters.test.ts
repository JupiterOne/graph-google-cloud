import { getMockRoleBinding } from '../../../test/mocks';
import { buildIamBindingEntityKey, createIamBindingEntity } from './converters';

describe('#createIamBindingEntity', () => {
  const resource = 'resource';
  const projectName = 'projects/123456789';
  const projectId = 'project-id';
  const folders = ['folders/1212121212', 'folders/3434343434'];
  const organization = 'organizations/5656565656';
  const binding = getMockRoleBinding();
  const permissions = ['storage.admin', 'storage.objects.list'];

  test('should convert to entity', () => {
    expect(
      createIamBindingEntity({
        _key: buildIamBindingEntityKey({
          binding,
          projectName,
          resource,
        }),
        binding,
        projectId,
        projectName,
        folders,
        organization,
        resource,
        permissions,
      }),
    ).toMatchSnapshot();
  });
});
