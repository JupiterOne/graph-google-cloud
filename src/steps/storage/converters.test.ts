import { getMockStorageBucket } from '../../../test/mocks';
import { createCloudStorageBucketEntity } from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createCloudStorageBucketEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        accessLevel: 'private',
      }),
    ).toMatchSnapshot();
  });

  test('should convert to entity with isPublic param set to true', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        accessLevel: 'public',
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
        accessLevel: 'private',
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
        accessLevel: 'private',
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
        accessLevel: 'private',
      }),
    ).toMatchSnapshot();
  });

  test('should set "public" to "false" if "accessLevel" is "undefined"', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket({
          iamConfiguration: undefined,
        }),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        accessLevel: undefined,
      }),
    ).toMatchSnapshot();
  });

  test('should set "accessLevel" to "SubjectToObjectACLs" when "uniformBucketLevelAccess" is not enabled and accessLevel is "private"', () => {
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
        accessLevel: 'private',
      }),
    ).toMatchObject({
      accessLevel: 'SubjectToObjectACLs',
      accessLevelIsConditional: true,
      accessLevelCondition: 'Subject to object ACLs',
    });
  });

  test('should set "accessLevel" to whatever the access level is when "uniformBucketLevelAccess" is not enabled and accessLevel is not "private"', () => {
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
        accessLevel: 'publicRead',
        condition: 'condition',
      }),
    ).toMatchObject({
      accessLevel: 'publicRead',
      accessLevelIsConditional: true,
      accessLevelCondition: 'condition',
    });

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
        accessLevel: 'publicWrite',
      }),
    ).toMatchObject({
      accessLevel: 'publicWrite',
      accessLevelIsConditional: false,
      accessLevelCondition: undefined,
    });
  });
});
