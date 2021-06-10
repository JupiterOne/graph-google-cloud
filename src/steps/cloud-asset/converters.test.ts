import { getMockRoleBinding } from '../../../test/mocks';
import { buildIamBindingEntityKey, createIamBindingEntity } from './converters';

describe('#createIamBindingEntity', () => {
  test('should convert to entity', () => {
    const resource = 'resource';
    const projectName = 'projects/123456789';
    const projectId = 'project-id';
    const binding = getMockRoleBinding();

    const _key = buildIamBindingEntityKey({
      binding,
      projectName,
      resource,
    });

    expect(
      createIamBindingEntity({
        _key,
        binding,
        projectId,
        resource,
      }),
    ).toMatchSnapshot();
  });
});
