import { getMockRoleBinding } from '../../../test/mocks';
import { createIamBindingEntity } from './converters';

describe('#createIamBindingEntity', () => {
  test('should convert to entity', () => {
    const resource = 'resource';
    const project = 'project';
    expect(
      createIamBindingEntity(getMockRoleBinding(), project, resource),
    ).toMatchSnapshot();
  });
});
