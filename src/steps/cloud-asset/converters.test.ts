import { getMockRoleBinding } from '../../../test/mocks';
import { buildIamBindingEntityKey, createIamBindingEntity } from './converters';

describe('#createIamBindingEntity', () => {
  const resource = 'resource';
  const projectName = 'projects/123456789';
  const projectId = 'project-id';
  const binding = getMockRoleBinding();
  const isReadOnly = true;

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
        isReadOnly,
      }),
    ).toMatchSnapshot();
  });
});
