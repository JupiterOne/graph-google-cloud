import {
  createCertificateAuthorityEntity,
  createCertificateEntity,
} from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import {
  getMockCertificate,
  getMockCertificateAuthority,
} from '../../../test/mocks';

describe('#createCertificateAuthorityEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCertificateAuthorityEntity({
        data: getMockCertificateAuthority(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createCertificateEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCertificateEntity({
        data: getMockCertificate(),
        keyAlgorithm: 'RSA_PKCS1_2048_SHA256',
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      }),
    ).toMatchSnapshot();
  });
});
