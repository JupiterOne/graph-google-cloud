import { getMockCloudFunction } from '../../../test/mocks';
import { createCloudFunctionEntity } from './converters';

describe('#createCloudFunctionEntity', () => {
  test('should convert to entity', () => {
    expect(createCloudFunctionEntity(getMockCloudFunction())).toMatchSnapshot();
  });
});
