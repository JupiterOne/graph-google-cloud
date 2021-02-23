import {
  createLoggingProjectSinkEntity,
  createMetricEntity,
} from './converters';
import { getMockLoggingProjectSink, getMockMetric } from '../../../test/mocks';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createProjectSinkEntity', () => {
  test('should convert to entity', () => {
    expect(
      createLoggingProjectSinkEntity(
        getMockLoggingProjectSink(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});

describe('#createMetricEntity', () => {
  test('should convert to entity', () => {
    expect(
      createMetricEntity(
        getMockMetric(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
