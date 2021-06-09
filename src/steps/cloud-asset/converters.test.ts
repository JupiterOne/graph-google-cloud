import { getMockRoleBinding } from '../../../test/mocks';
import { buildIamBindingEntityKey, createIamBindingEntity } from './converters';

describe('#createIamBindingEntity', () => {
  test('should convert to entity', () => {
    const resource = 'resource';
    const project = 'project';
    const binding = getMockRoleBinding();

    const _key = buildIamBindingEntityKey({
      binding,
      project,
      resource,
    });

    expect(
      createIamBindingEntity({
        _key,
        binding,
        project,
        resource,
      }),
    ).toMatchSnapshot();
  });
});
