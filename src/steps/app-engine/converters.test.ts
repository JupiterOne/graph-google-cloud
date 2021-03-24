import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import {
  getMockAppEngineApplication,
  getMockAppEngineInstance,
  getMockAppEngineService,
  getMockAppEngineVersion,
} from '../../../test/mocks';
import {
  createAppEngineApplicationEntity,
  createAppEngineInstanceEntity,
  createAppEngineServiceEntity,
  createAppEngineVersionEntity,
} from './converters';

describe('#createAppEngineApplicationEntity', () => {
  test('should convert to entity', () => {
    expect(
      createAppEngineApplicationEntity(
        getMockAppEngineApplication(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createAppEngineServices', () => {
  test('should convert to entity', () => {
    expect(
      createAppEngineServiceEntity(getMockAppEngineService()),
    ).toMatchSnapshot();
  });
});

describe('#createAppEngineVersions', () => {
  test('should convert to entity', () => {
    expect(
      createAppEngineVersionEntity(
        getMockAppEngineVersion(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createAppEngineInstances', () => {
  test('should convert to entity', () => {
    expect(
      createAppEngineInstanceEntity(getMockAppEngineInstance()),
    ).toMatchSnapshot();
  });
});
