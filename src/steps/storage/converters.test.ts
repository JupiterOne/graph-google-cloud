import { getMockStorageBucket } from '../../../test/mocks';
import { createCloudStorageBucketEntity } from './converters';

const projectId = 'abc123';

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
          retentionPolicy: {
            retentionPeriod: '600',
            effectiveTime: '2021-01-27T20:10:45.870Z',
            isLocked: true,
          },
        }),
        projectId,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });

  test('should have retentionPolicyEnabled enabled if bucket is locked', () => {
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
