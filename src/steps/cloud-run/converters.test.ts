import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import {
  getMockCloudRunConfiguration,
  getMockCloudRunRoute,
  getMockCloudRunService,
} from '../../../test/mocks';
import {
  createCloudRunConfigurationEntity,
  createCloudRunRouteEntity,
  createCloudRunServiceEntity,
} from './converters';

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
    expect(createCloudRunRouteEntity(getMockCloudRunRoute())).toMatchSnapshot();
  });
});

describe('#createCloudRunConfigurationEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudRunConfigurationEntity(getMockCloudRunConfiguration()),
    ).toMatchSnapshot();
  });
});
