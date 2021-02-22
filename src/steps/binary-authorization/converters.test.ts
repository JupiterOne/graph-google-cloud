import { getMockBinaryAuthorizationPolicy } from '../../../test/mocks';
import { createBinaryAuthorizationPolicyEntity } from './converters';

const DEFAULT_INTEGRATION_CONFIG_PROJECT_ID = 'j1-gc-integration-dev-v2';

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
