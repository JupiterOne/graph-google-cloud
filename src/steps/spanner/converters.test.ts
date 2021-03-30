import {
  getMockSpannerInstance,
  getMockSpannerInstanceConfiguration,
  getMockSpannerInstanceDatabase,
} from '../../../test/mocks';
import {
  createSpannerInstanceConfiguration,
  createSpannerInstanceDatabaseEntity,
  createSpannerInstanceEntity,
} from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createSpannerInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createSpannerInstanceEntity({
        data: getMockSpannerInstance(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createSpannerInstanceDatabaseEntity', () => {
  test('should convert to entity', () => {
    expect(
      createSpannerInstanceDatabaseEntity({
        data: getMockSpannerInstanceDatabase(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createSpannerInstanceConfiguration', () => {
  test('should convert to entity', () => {
    expect(
      createSpannerInstanceConfiguration(getMockSpannerInstanceConfiguration()),
    ).toMatchSnapshot();
  });
});
