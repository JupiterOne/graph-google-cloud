import {
  createLoggingProjectSinkEntity,
  createMetricEntity,
} from './converters';
import { getMockLoggingProjectSink, getMockMetric } from '../../../test/mocks';

describe('#createProjectSinkEntity', () => {
  test('should convert to entity', () => {
    expect(
      createLoggingProjectSinkEntity(getMockLoggingProjectSink()),
    ).toMatchSnapshot();
  });
});

describe('#createMetricEntity', () => {
  test('should convert to entity', () => {
    expect(createMetricEntity(getMockMetric())).toMatchSnapshot();
  });
});
