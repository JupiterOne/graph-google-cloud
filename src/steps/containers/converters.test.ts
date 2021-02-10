import { createContainerClusterEntity } from './converters';
import { getMockContainerCluster } from '../../../test/mocks';

describe('#createContainerClusterEntity', () => {
  test('should convert to entity', () => {
    expect(
      createContainerClusterEntity(getMockContainerCluster()),
    ).toMatchSnapshot();
  });
});
