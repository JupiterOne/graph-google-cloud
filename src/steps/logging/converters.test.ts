import {
  createLoggingProjectSinkEntity,
  createMetricEntity,
} from './converters';
import { getMockLoggingProjectSink, getMockMetric } from '../../../test/mocks';

// Couldn't use the one from test/config since mine is different value
const DEFAULT_INTEGRATION_CONFIG_PROJECT_ID = 'j1-gc-integration-dev-300716';

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
