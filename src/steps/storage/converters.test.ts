import {
  getMockStorageBucket,
  getMockStorageBucketPolicy,
} from '../../../test/mocks';
import { createCloudStorageBucketEntity } from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';

describe('#createCloudStorageBucketEntity', () => {
  test('should convert to entity', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        publicAccessPreventionPolicy: false,
      }),
    ).toMatchSnapshot();
  });

  test('should convert to entity with isPublic param set to true', () => {
    expect(
      createCloudStorageBucketEntity({
        data: getMockStorageBucket(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        bucketPolicy: getMockStorageBucketPolicy({
          bindings: [
            {
              role: 'roles/composer.environmentAndStorageObjectViewer',
              members: ['user:example.user@test.com'],
            },
            {
              role: 'roles/storage.legacyBucketOwner',
              members: ['allUsers', 'user:example.user@test.com'],
            },
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        }),
        publicAccessPreventionPolicy: false,
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
        bucketPolicy: getMockStorageBucketPolicy({
          bindings: [
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        }),
        publicAccessPreventionPolicy: false,
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
        bucketPolicy: getMockStorageBucketPolicy({
          bindings: [
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        }),
        publicAccessPreventionPolicy: false,
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
        bucketPolicy: getMockStorageBucketPolicy({
          bindings: [
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        }),
        publicAccessPreventionPolicy: false,
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
        bucketPolicy: getMockStorageBucketPolicy({
          bindings: [
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        }),
        publicAccessPreventionPolicy: undefined,
      }),
    ).toMatchObject({
      public: undefined,
    });
  });

  test('should set "public" to "true" if "bucketPolicy" doesn\'t allow access but the bucket is subject to object ACLs and publicAccessPrevention does not exists', () => {
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
        bucketPolicy: getMockStorageBucketPolicy({
          bindings: [
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        }),
        publicAccessPreventionPolicy: false,
      }),
    ).toMatchObject({
      public: true,
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
        bucketPolicy: getMockStorageBucketPolicy({
          bindings: [
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        }),
        publicAccessPreventionPolicy: undefined,
      }),
    ).toMatchSnapshot();
  });
});
