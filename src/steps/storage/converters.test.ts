import { getMockStorageBucket } from '../../../test/mocks';
import { createCloudStorageBucketEntity } from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import { NearestOrgPolicyResult } from '../orgpolicy';

describe('#createCloudStorageBucketEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
        publicAccessPrevention: undefined,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to entity with isPublic param set to true', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: true,
        publicAccessPrevention: {
          organizationPolicy: undefined,
          result: NearestOrgPolicyResult.NOT_FOUND,
        },
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
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
        publicAccessPrevention: undefined,
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
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
        publicAccessPrevention: undefined,
      }),
    ).toMatchSnapshot();
  });

  test('should have retentionPolicyEnabled enabled if bucket is locked', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          iamConfiguration: undefined,
        }),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
        publicAccessPrevention: undefined,
      }),
    ).toMatchSnapshot();
  });

  test('should set "public" to "false" if "isPublic" is "undefined"', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          iamConfiguration: undefined,
        }),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: undefined,
        publicAccessPrevention: undefined,
      }),
    ).toMatchSnapshot();
  });

  test('should set "public" to "undefined" if publicAccessPrevention is undefined', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          iamConfiguration: {
            uniformBucketLevelAccess: {
              enabled: false,
            },
          },
        }),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: true,
        publicAccessPrevention: undefined,
      }),
    ).toMatchObject({
      public: undefined,
    });
  });

  test('should set "public" to "true" if "isPublic" is "false" but the bucket is subject to object ACLs and publicAccessPrevention does not exists', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          iamConfiguration: {
            uniformBucketLevelAccess: {
              enabled: false,
            },
          },
        }),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
        publicAccessPrevention: {
          result: NearestOrgPolicyResult.NOT_FOUND,
          organizationPolicy: undefined,
        },
      }),
    ).toMatchObject({
      public: true,
      isSubjectToObjectAcls: true,
    });
  });

  test('should convert to entity with versioning enabled', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          versioning: {
            enabled: true,
          },
        }),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
        publicAccessPrevention: undefined,
      }),
    ).toMatchSnapshot();
  });
});
