import {
  createOrganizationEntity,
  createProjectEntity,
  createAuditConfigEntity,
} from './converters';
import {
  getMockProject,
  getMockOrganization,
  getMockAuditConfig,
} from '../../../test/mocks';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createProjectEntity', () => {
  test('should convert entity', () => {
    expect(
      createProjectEntity(
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        getMockProject(),
      ),
    ).toMatchSnapshot();
  });

  test('should convert entity with just projectId', () => {
    expect(
      createProjectEntity(DEFAULT_INTEGRATION_CONFIG_PROJECT_ID, undefined),
    ).toMatchSnapshot();
  });
});

describe('#createOrganizationEntity', () => {
  test('should convert to entity', () => {
    expect(createOrganizationEntity(getMockOrganization())).toMatchSnapshot();
  });
});

describe('#createAuditConfigEntity', () => {
  test('should convert to entity', () => {
    expect(createAuditConfigEntity(getMockAuditConfig())).toMatchSnapshot();
  });
});
