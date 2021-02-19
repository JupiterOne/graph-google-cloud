import { getMockBinaryAuthorizationPolicy } from '../../../test/mocks';
import { createBinaryAuthorizationPolicyEntity } from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createBinaryAuthorizationPolicy', () => {
  test('should convert to entity', () => {
    expect(
      createBinaryAuthorizationPolicyEntity(
        getMockBinaryAuthorizationPolicy(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
