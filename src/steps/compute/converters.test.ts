import {
  createComputeDiskEntity,
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
} from './converters';
import {
  getMockComputeDisk,
  getMockComputeInstance,
} from '../../../test/mocks';

describe('#createComputeDiskEntity', () => {
  test('should convert to entity', () => {
    expect(createComputeDiskEntity(getMockComputeDisk())).toMatchSnapshot();
  });

  test('should set active to false when status is not READY', () => {
    expect(
      createComputeDiskEntity(getMockComputeDisk({ status: 'FAILED' })),
    ).toMatchSnapshot();
  });
});

describe('#createComputeInstanceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createComputeInstanceEntity(getMockComputeInstance()),
    ).toMatchSnapshot();
  });

  test('should set active to false when status is not RUNNING', () => {
    expect(
      createComputeInstanceEntity(
        getMockComputeInstance({ status: 'SUSPENDED' }),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createComputeInstanceUsesComputeDiskRelationship', () => {
  test('should convert to relationship', () => {
    const computeDiskEntity = createComputeDiskEntity(getMockComputeDisk());
    const computeInstance = getMockComputeInstance();
    const computeInstanceEntity = createComputeInstanceEntity(computeInstance);

    expect(
      createComputeInstanceUsesComputeDiskRelationship({
        computeInstanceEntity,
        computeDiskEntity,
        mode: 'READ_WRITE',
        autoDelete: true,
        deviceName: 'persisten-disk-0',
        interface: 'SCSI',
      }),
    ).toMatchSnapshot();
  });
});
