import {
  createAccessLevelEntity,
  createAccessPolicyEntity,
  createServicePerimeterApiOperationEntity,
  createServicePerimeterEgressPolicyEntity,
  createServicePerimeterEntity,
  createServicePerimeterIngressPolicyEntity,
  createServicePerimeterMethodSelectorEntity,
} from './converters';
import {
  getMockAccessPolicy,
  getMockAccessLevel,
  getMockServicePerimeter,
  getMockServicePerimeterEgressPolicy,
  getMockServicePerimeterIngressPolicy,
  getMockServicePerimeterApiOperation,
  getMockServicePerimeterMethodSelector,
} from '../../../test/mocks';

describe('#createAccessPolicyEntity', () => {
  test('should convert to entity', () => {
    expect(createAccessPolicyEntity(getMockAccessPolicy())).toMatchSnapshot();
  });
});

describe('#createAccessLevelEntity', () => {
  test('should convert to entity', () => {
    expect(createAccessLevelEntity(getMockAccessLevel())).toMatchSnapshot();
  });
});

describe('#createServicePerimeterEntity', () => {
  test('should convert to entity', () => {
    expect(
      createServicePerimeterEntity(getMockServicePerimeter()),
    ).toMatchSnapshot();
  });
});

describe('#createServicePerimeterEgressPolicyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createServicePerimeterEgressPolicyEntity({
        servicePerimeter: getMockServicePerimeter(),
        egressPolicy: getMockServicePerimeterEgressPolicy(),
        egressIndex: 0,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createServicePerimeterIngressPolicyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createServicePerimeterIngressPolicyEntity({
        servicePerimeter: getMockServicePerimeter(),
        ingressPolicy: getMockServicePerimeterIngressPolicy(),
        ingressIndex: 0,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createServicePerimeterApiOperationEntity', () => {
  test('should convert to entity', () => {
    expect(
      createServicePerimeterApiOperationEntity({
        servicePerimeter: getMockServicePerimeter(),
        operation: getMockServicePerimeterApiOperation(),
        policyIndex: 0,
        operationIndex: 0,
        type: 'egress',
      }),
    ).toMatchSnapshot();
  });
});

describe('#createServicePerimeterMethodSelectorEntity', () => {
  test('should convert to entity', () => {
    expect(
      createServicePerimeterMethodSelectorEntity({
        servicePerimeter: getMockServicePerimeter(),
        methodSelector: getMockServicePerimeterMethodSelector(),
        policyIndex: 0,
        operationIndex: 0,
        methodIndex: 0,
        type: 'egress',
      }),
    ).toMatchSnapshot();
  });
});
