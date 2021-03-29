import {
  getMockMemcacheInstance,
  getMockMemcacheNode,
} from '../../../test/mocks';
import {
  createMemcacheInstanceEntity,
  createMemcacheNodeEntity,
} from './converter';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

const DEFAULT_INSTANCE_NAME =
  'projects/j1-gc-integration-dev-v2/locations/us-central1/instances/test-memcached-instance';

describe('#createMemcacheInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createMemcacheInstanceEntity(
        getMockMemcacheInstance(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createMemcacheNodeEntity', () => {
  test('should convert to entity', () => {
    expect(
      createMemcacheNodeEntity(
        getMockMemcacheNode(),
        DEFAULT_INSTANCE_NAME,
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
