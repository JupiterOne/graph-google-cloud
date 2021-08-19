import { getMockRoleBinding } from '../../../test/mocks';
import { PUBLIC_MEMBERS } from '../../utils/iam';
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

  PUBLIC_MEMBERS.forEach((member) => {
    it(`Should set isOpenToTheInternet to "true" when a member is ${member}`, () => {
      expect(
        createIamBindingEntity({
          _key: buildIamBindingEntityKey({
            binding,
            projectName,
            resource,
          }),
          binding: {
            ...binding,
            members: [member],
          },
          projectId,
          resource,
          isReadOnly,
        }).isOpenToTheInternet,
      ).toBe(true);
    });
  });

  ['gerald', 'nobody@here.com'].forEach((member) => {
    it(`Should set isOpenToTheInternet to "false" when roles are assigned to specific users`, () => {
      expect(
        createIamBindingEntity({
          _key: buildIamBindingEntityKey({
            binding,
            projectName,
            resource,
          }),
          binding: {
            ...binding,
            members: [member],
          },
          projectId,
          resource,
          isReadOnly,
        }).isOpenToTheInternet,
      ).toBe(false);
    });
  });
});
