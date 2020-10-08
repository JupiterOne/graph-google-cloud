import { storage_v1 } from 'googleapis';
import { createCloudStorageBucketEntity } from './converters';

const projectId = 'abc123';

function getMockStorageBucket(
  partial?: Partial<storage_v1.Schema$Bucket>,
): storage_v1.Schema$Bucket {
  return {
    kind: 'storage#bucket',
    selfLink:
      'https://www.googleapis.com/storage/v1/b/customer-managed-encryption-key-bucket-1234',
    id: 'customer-managed-encryption-key-bucket-1234',
    name: 'customer-managed-encryption-key-bucket-1234',
    projectNumber: '1234',
    metageneration: '1',
    location: 'US',
    storageClass: 'STANDARD',
    etag: 'CAE=',
    timeCreated: '2020-07-28T19:06:14.033Z',
    updated: '2020-07-28T19:06:14.033Z',
    encryption: {
      defaultKmsKeyName:
        'projects/j1-gc-integration-dev/locations/us/keyRings/j1-gc-integration-dev-bucket-ring/cryptoKeys/j1-gc-integration-dev-bucket-key',
    },
    iamConfiguration: {
      bucketPolicyOnly: {
        enabled: false,
      },
      uniformBucketLevelAccess: {
        enabled: false,
      },
    },
    locationType: 'multi-region',
    ...partial,
  };
}

describe('#createCloudStorageBucketEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to entity with isPublic param set to true', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId,
        isPublic: true,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to entity with uniformBucketAccess enabled', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          iamConfiguration: {
            bucketPolicyOnly: {
              enabled: false,
            },
            uniformBucketLevelAccess: {
              enabled: true,
            },
          },
        }),
        projectId,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });

  test('should handle missing iamConfiguration', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          iamConfiguration: undefined,
        }),
        projectId,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});
