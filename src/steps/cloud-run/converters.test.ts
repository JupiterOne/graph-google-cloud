import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import {
  getMockCloudRunConfiguration,
  getMockCloudRunRoute,
  getMockCloudRunService,
} from '../../../test/mocks';
import { createCloudRunServiceEntity } from './converters';

describe('#createCloudRunServiceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudRunServiceEntity(
        getMockCloudRunService(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createCloudRunRouteEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudRunServiceEntity(
        getMockCloudRunRoute(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createCloudRunConfigurationEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudRunServiceEntity(
        getMockCloudRunConfiguration(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
