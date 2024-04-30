import { createKmsCryptoKeyEntity, createKmsKeyRingEntity } from './converters';
import {
  getMockKmsKeyRing,
  getMockKmsCryptoKey,
  getMockKmsCryptoKeyIamPolicy,
} from '../../../test/mocks';

describe('#createKmsKeyRingEntity', () => {
  jest.setTimeout(450000);

  test('should convert to entity', () => {
    expect(createKmsKeyRingEntity(getMockKmsKeyRing())).toMatchSnapshot();
  });
});

describe('#createKmsCryptoKeyEntity', () => {
  jest.setTimeout(450000);

  test('should convert to entity', () => {
    expect(
      createKmsCryptoKeyEntity({
        cryptoKey: getMockKmsCryptoKey(),
        location: 'us',
        projectId: 'j1-gc-integration-dev-v3',
        cryptoKeyRingShortName: 'j1-gc-integration-dev-v2-bucket-ring',
        iamPolicy: getMockKmsCryptoKeyIamPolicy(),
      }),
    ).toMatchSnapshot();
  });

  test('should convert to entity with public=true if there is allAuthenticatedUsers bindings', () => {
    expect(
      createKmsCryptoKeyEntity({
        cryptoKey: getMockKmsCryptoKey(),
        location: 'us',
        projectId: 'j1-gc-integration-dev-v3',
        cryptoKeyRingShortName: 'j1-gc-integration-dev-v2-bucket-ring',
        iamPolicy: getMockKmsCryptoKeyIamPolicy({
          bindings: [
            {
              role: 'roles/cloudkms.cryptoKeyEncrypter',
              members: ['allAuthenticatedUsers'],
            },
          ],
        }),
      }),
    ).toMatchSnapshot();
  });

  test('should convert to entity with public=true if there is allUsers bindings', () => {
    expect(
      createKmsCryptoKeyEntity({
        cryptoKey: getMockKmsCryptoKey(),
        location: 'us',
        projectId: 'j1-gc-integration-dev-v3',
        cryptoKeyRingShortName: 'j1-gc-integration-dev-v2-bucket-ring',
        iamPolicy: getMockKmsCryptoKeyIamPolicy({
          bindings: [
            {
              role: 'roles/cloudkms.cryptoKeyEncrypter',
              members: ['allUsers'],
            },
          ],
        }),
      }),
    ).toMatchSnapshot();
  });
});
