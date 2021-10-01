import { getMockRoleBinding } from '../../../test/mocks';
import { buildIamBindingEntityKey, createIamBindingEntity } from './converters';

describe('#createIamBindingEntity', () => {
  const resource = 'resource';
  const projectName = 'projects/123456789';
  const projectId = 'project-id';
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
        resource,
        permissions,
      }),
    ).toMatchSnapshot();
  });
});
