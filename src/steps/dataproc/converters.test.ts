import { getMockDataprocCluster } from '../../../test/mocks';
import { createDataprocClusterEntity } from './converters';

describe('#createDataprocClusterEntity', () => {
  test('should convert to entity', () => {
    expect(
      createDataprocClusterEntity(getMockDataprocCluster()),
    ).toMatchSnapshot();
  });
});
