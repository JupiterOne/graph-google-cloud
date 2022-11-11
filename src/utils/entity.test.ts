import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { storage_v1 } from 'googleapis';
import { getMockStorageBucket } from '../../test/mocks';
import { StorageEntitiesSpec } from '../steps/storage/constants';
import {
  getCloudStorageBucketKey,
  getCloudStorageBucketWebLink,
} from '../steps/storage/converters';
import { createGoogleCloudIntegrationEntity } from './entity';

function getMockStorageBucketEntityBuilderInput(
  data: storage_v1.Schema$Bucket,
  projectId: string,
) {
  return {
    entityData: {
      source: data,
      assign: {
        _class: StorageEntitiesSpec.STORAGE_BUCKET._class,
        _type: StorageEntitiesSpec.STORAGE_BUCKET._type,
        _key: getCloudStorageBucketKey(data.id as string),
        id: data.id as string,
        name: data.name,
        displayName: data.name as string,
        storageClass: data.storageClass,
        createdOn: parseTimePropertyValue(data.timeCreated),
        updatedOn: parseTimePropertyValue(data.updated),
        // Storage buckets are encrypted by default
        encrypted: true,
        // If not set, we are using the default Google Encryption key
        encryptionKeyRef: data.encryption?.defaultKmsKeyName,
        kmsKeyName: data.encryption?.defaultKmsKeyName,
        // https://cloud.google.com/storage/docs/uniform-bucket-level-access
        uniformBucketLevelAccess:
          data.iamConfiguration?.uniformBucketLevelAccess?.enabled === true,
        // 2.3 Ensure that retention policies on log buckets are configured using Bucket Lock (Scored)
        retentionPolicyEnabled: data.retentionPolicy?.isLocked,
        retentionPeriod: data.retentionPolicy?.retentionPeriod,
        retentionDate: data.retentionPolicy?.effectiveTime,
        public: false,
        // Rely on the value of the classification tag
        classification: null,
        etag: data.etag,
        webLink: getCloudStorageBucketWebLink(data, projectId),
      },
    },
  };
}

describe('#createGoogleCloudIntegrationEntity', () => {
  test('should produce entity and copy labels if labels exist on resource', () => {
    const projectId = 'j1';
    const mockStorageBucket = getMockStorageBucket({
      labels: {
        myLabel: 'test',
      },
    });

    expect(
      createGoogleCloudIntegrationEntity(
        mockStorageBucket,
        getMockStorageBucketEntityBuilderInput(mockStorageBucket, projectId),
      ),
    ).toMatchSnapshot();
  });

  test('should produce entity and not fail if labels do not exist on resource', () => {
    const projectId = 'j1';
    const mockStorageBucket = getMockStorageBucket({
      labels: undefined,
    });

    expect(
      createGoogleCloudIntegrationEntity(
        mockStorageBucket,
        getMockStorageBucketEntityBuilderInput(mockStorageBucket, projectId),
      ),
    ).toMatchSnapshot();
  });
});
