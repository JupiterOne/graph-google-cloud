import {
  executeStepWithDependencies,
  Recording,
  StepTestConfig,
} from '@jupiterone/integration-sdk-testing';
import { StorageStepsSpec } from '../storage/constants';
import {
  setupGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { invocationConfig } from '../..';
import { BucketAccess, getPublicState } from '.';

describe(`storage#${StorageStepsSpec.FETCH_STORAGE_BUCKETS.id}`, () => {
  let recording: Recording;
  afterEach(async () => {
    if (recording) await recording.stop();
  });

  jest.setTimeout(45000);

  test(StorageStepsSpec.FETCH_STORAGE_BUCKETS.id, async () => {
    recording = setupGoogleCloudRecording({
      name: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    });

    const stepTestConfig: StepTestConfig = {
      stepId: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      instanceConfig: integrationConfig,
      invocationConfig: invocationConfig as any,
    };

    const result = await executeStepWithDependencies(stepTestConfig);
    expect(result).toMatchStepMetadata(stepTestConfig);
  });

  test('getPublicState - should return isPublicBucket true and access (Public to internet) if isBucketPolicyPublicAccess and publicAccessPreventionPolicy are true.', () => {
    expect(
      getPublicState({
        bucketPolicy: {
          kind: 'storage#policy',
          resourceId:
            'projects/_/buckets/j1-gc-integration-dev-v3-super-secret-stuff',
          version: 1,
          etag: 'CBQ=',
          bindings: [
            {
              role: 'organizations/958457776463/roles/NothingToSeeHere',
              members: ['allUsers', 'projectViewer:j1-gc-integration-dev-v3'],
            },
            {
              role: 'roles/storage.legacyBucketOwner',
              members: [
                'projectEditor:j1-gc-integration-dev-v3',
                'projectOwner:j1-gc-integration-dev-v3',
              ],
            },
            {
              role: 'roles/storage.legacyBucketReader',
              members: [
                'projectViewer:j1-gc-integration-dev-v3',
                'serviceAccount:service-167984947943@gcp-sa-privateca.iam.gserviceaccount.com',
              ],
            },
            {
              role: 'roles/storage.objectAdmin',
              members: [
                'serviceAccount:service-167984947943@gcp-sa-privateca.iam.gserviceaccount.com',
              ],
            },
          ],
        },
        publicAccessPreventionPolicy: false,
        iamConfiguration: {
          bucketPolicyOnly: { enabled: false },
          uniformBucketLevelAccess: { enabled: false },
          publicAccessPrevention: 'inherited',
        },
      }),
    ).toMatchObject({
      isPublicBucket: true,
      access: BucketAccess.PUBLIC_TO_INTERNET,
    });
  });

  test('getPublicState - should return isPublicBucket true and access (Subject to object ACLs) if isObjectAcl is true and iamConfiguration.publicAccessPrevention IS NOT enforce,', () => {
    expect(
      getPublicState({
        bucketPolicy: {
          kind: 'storage#policy',
          resourceId:
            'projects/_/buckets/j1-gc-integration-dev-v3-sink-logging-bucket',
          version: 1,
          etag: 'CAI=',
          bindings: [
            {
              role: 'roles/storage.legacyBucketOwner',
              members: [
                'projectEditor:j1-gc-integration-dev-v3',
                'projectOwner:j1-gc-integration-dev-v3',
              ],
            },
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        },
        publicAccessPreventionPolicy: false,
        iamConfiguration: {
          bucketPolicyOnly: { enabled: false },
          uniformBucketLevelAccess: { enabled: false },
          publicAccessPrevention: 'inherited',
        },
      }),
    ).toMatchObject({
      isPublicBucket: true,
      access: BucketAccess.SUBJECT_TO_OBJECT_ACLS,
    });
  });

  test('getPublicState - should return isPublicBucket true and access (Not Public) if isObjectAcl is true and iamConfiguration.publicAccessPrevention IS enforce,', () => {
    expect(
      getPublicState({
        bucketPolicy: {
          kind: 'storage#policy',
          resourceId:
            'projects/_/buckets/j1-gc-integration-dev-v3-test-tf-bucket',
          version: 1,
          etag: 'CAI=',
          bindings: [
            {
              role: 'roles/storage.legacyBucketOwner',
              members: [
                'projectEditor:j1-gc-integration-dev-v3',
                'projectOwner:j1-gc-integration-dev-v3',
              ],
            },
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        },
        publicAccessPreventionPolicy: false,
        iamConfiguration: {
          bucketPolicyOnly: { enabled: false },
          uniformBucketLevelAccess: { enabled: false },
          publicAccessPrevention: 'enforced',
        },
      }),
    ).toMatchObject({
      isPublicBucket: false,
      access: BucketAccess.NOT_PUBLIC,
    });
  });

  test('getPublicState - should return isPublicBucket true and access (Not Public) if isObjectAcl is false and publicAccessPreventionPolicy is false and iamConfiguration.publicAccessPrevention IS NOT enforce.', () => {
    expect(
      getPublicState({
        bucketPolicy: {
          kind: 'storage#policy',
          resourceId: 'projects/_/buckets/gcf-sources-167984947943-us-central1',
          version: 1,
          etag: 'CAE=',
          bindings: [
            {
              role: 'roles/storage.legacyBucketOwner',
              members: [
                'projectEditor:j1-gc-integration-dev-v3',
                'projectOwner:j1-gc-integration-dev-v3',
              ],
            },
            {
              role: 'roles/storage.legacyBucketReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
            {
              role: 'roles/storage.legacyObjectOwner',
              members: [
                'projectEditor:j1-gc-integration-dev-v3',
                'projectOwner:j1-gc-integration-dev-v3',
              ],
            },
            {
              role: 'roles/storage.legacyObjectReader',
              members: ['projectViewer:j1-gc-integration-dev-v3'],
            },
          ],
        },
        publicAccessPreventionPolicy: false,
        iamConfiguration: {
          bucketPolicyOnly: { enabled: true },
          uniformBucketLevelAccess: { enabled: true },
          publicAccessPrevention: 'inherited',
        },
      }),
    ).toMatchObject({
      isPublicBucket: false,
      access: BucketAccess.NOT_PUBLIC,
    });
  });

  test('getPublicState - should return isPublicBucket false and access (Not Public) if publicAccessPreventionPolicy is true.', () => {
    expect(
      getPublicState({
        bucketPolicy: {
          kind: 'storage#policy',
          resourceId:
            'projects/_/buckets/j1-gc-integration-dev-v3-super-secret-stuff',
          version: 1,
          etag: 'CBQ=',
          bindings: [
            {
              role: 'organizations/958457776463/roles/NothingToSeeHere',
              members: ['allUsers', 'projectViewer:j1-gc-integration-dev-v3'],
            },
            {
              role: 'roles/storage.legacyBucketOwner',
              members: [
                'projectEditor:j1-gc-integration-dev-v3',
                'projectOwner:j1-gc-integration-dev-v3',
              ],
            },
            {
              role: 'roles/storage.legacyBucketReader',
              members: [
                'projectViewer:j1-gc-integration-dev-v3',
                'serviceAccount:service-167984947943@gcp-sa-privateca.iam.gserviceaccount.com',
              ],
            },
            {
              role: 'roles/storage.objectAdmin',
              members: [
                'serviceAccount:service-167984947943@gcp-sa-privateca.iam.gserviceaccount.com',
              ],
            },
          ],
        },
        publicAccessPreventionPolicy: true,
        iamConfiguration: {
          bucketPolicyOnly: { enabled: false },
          uniformBucketLevelAccess: { enabled: false },
          publicAccessPrevention: 'inherited',
        },
      }),
    ).toMatchObject({
      isPublicBucket: false,
      access: BucketAccess.NOT_PUBLIC,
    });
  });
});
