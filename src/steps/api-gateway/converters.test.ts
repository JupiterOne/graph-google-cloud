import {
  getMockApiGatewayApi,
  getMockApiGatewayApiConfig,
  getMockApiGatewayGateway,
} from '../../../test/mocks';
import {
  createApiGatewayApiConfigEntity,
  createApiGatewayApiEntity,
  createApiGatewayGatewayEntity,
} from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createApiGatewayApiEntity', () => {
  test('should convert to entity', () => {
    expect(
      createApiGatewayApiEntity({
        data: getMockApiGatewayApi(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createApiGatewayApiConfigEntity', () => {
  test('should convert to entity', () => {
    expect(
      createApiGatewayApiConfigEntity({
        data: getMockApiGatewayApiConfig(),
        apiId: getMockApiGatewayApi().name?.split('/')[5] as string,
        apiManagedService: getMockApiGatewayApi().managedService as string,
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createApiGatewayGatewayEntity', () => {
  test('should convert to entity', () => {
    expect(
      createApiGatewayGatewayEntity({
        data: getMockApiGatewayGateway(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});
