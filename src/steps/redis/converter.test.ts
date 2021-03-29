import { getMockRedisInstance } from '../../../test/mocks';
import { createRedisInstanceEntity } from './converter';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createRedisInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createRedisInstanceEntity(
        getMockRedisInstance(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have transitEncryptionModeEnabled set to false if it is disabled', () => {
    expect(
      createRedisInstanceEntity(
        getMockRedisInstance({
          transitEncryptionMode: 'DISABLED',
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have transitEncryptionModeEnabled set to true if it is enabled', () => {
    expect(
      createRedisInstanceEntity(
        getMockRedisInstance({
          transitEncryptionMode: 'ENABLED',
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have authEnabled set to false if it is disabled', () => {
    expect(
      createRedisInstanceEntity(
        getMockRedisInstance(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have authEnabled set to true if it is enabled', () => {
    expect(
      createRedisInstanceEntity(
        getMockRedisInstance({
          authEnabled: true,
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
