import { createKmsCryptoKeyEntity, createKmsKeyRingEntity } from './converters';
import { cloudkms_v1 } from 'googleapis';

function getMockKmsKeyRing(
  data?: cloudkms_v1.Schema$KeyRing,
): cloudkms_v1.Schema$KeyRing {
  return {
    name:
      'projects/j1-gc-integration-dev/locations/us/keyRings/j1-gc-integration-dev-bucket-ring',
    createTime: '2020-07-28T18:34:26.034565002Z',
    ...data,
  };
}

function getMockKmsCryptoKey(
  data?: cloudkms_v1.Schema$CryptoKey,
): cloudkms_v1.Schema$CryptoKey {
  return {
    name:
      'projects/j1-gc-integration-dev/locations/us/keyRings/j1-gc-integration-dev-bucket-ring/cryptoKeys/j1-gc-integration-dev-bucket-key',
    primary: {
      name:
        'projects/j1-gc-integration-dev/locations/us/keyRings/j1-gc-integration-dev-bucket-ring/cryptoKeys/j1-gc-integration-dev-bucket-key/cryptoKeyVersions/68',
      state: 'ENABLED',
      createTime: '2020-10-03T19:01:13.428484662Z',
      protectionLevel: 'SOFTWARE',
      algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION',
      generateTime: '2020-10-03T19:01:13.428484662Z',
    },
    purpose: 'ENCRYPT_DECRYPT',
    createTime: '2020-07-28T18:59:59.513564921Z',
    nextRotationTime: '2020-10-04T19:01:14.428484Z',
    rotationPeriod: '86401s',
    versionTemplate: {
      protectionLevel: 'SOFTWARE',
      algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION',
    },
    ...data,
  };
}

describe('#createKmsKeyRingEntity', () => {
  test('should convert to entity', () => {
    expect(createKmsKeyRingEntity(getMockKmsKeyRing())).toMatchSnapshot();
  });
});

describe('#createKmsCryptoKeyEntity', () => {
  test('should convert to entity', () => {
    expect(
      createKmsCryptoKeyEntity({
        cryptoKey: getMockKmsCryptoKey(),
        location: 'us',
        projectId: 'j1-gc-integration-dev',
        cryptoKeyRingShortName: 'j1-gc-integration-dev-bucket-ring',
      }),
    ).toMatchSnapshot();
  });
});
