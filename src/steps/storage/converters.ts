import { storage_v1 } from 'googleapis';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
} from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';

export function getCloudStorageBucketWebLink(
  data: storage_v1.Schema$Bucket,
  projectId: string,
) {
  return `https://console.cloud.google.com/storage/browser/${data.name};tab=objects?forceOnBucketsSortingFiltering=false&project=${projectId}`;
}

export function getCloudStorageBucketKey(id: string) {
  return `bucket:${id}`;
}

export function createCloudStorageBucketEntity({
  data,
  projectId,
  isPublic,
}: {
  data: storage_v1.Schema$Bucket;
  projectId: string;
  isPublic?: boolean;
}) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
        _type: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
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
        public: isPublic || false,
        // Rely on the value of the classification tag
        classification: null,
        etag: data.etag,
        webLink: getCloudStorageBucketWebLink(data, projectId),
      },
    },
  });
}
