import { storage_v1 } from 'googleapis';
import {
  createIntegrationEntity,
  getTime,
} from '@jupiterone/integration-sdk-core';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
} from './constants';
import { generateEntityKey } from '../../utils/generateKeys';

function getCloudStorageBucketWebLink(
  data: storage_v1.Schema$Bucket,
  projectId: string,
) {
  return `https://console.cloud.google.com/storage/browser/${data.name};tab=objects?forceOnBucketsSortingFiltering=false&project=${projectId}`;
}

export function createCloudStorageBucketEntity(
  data: storage_v1.Schema$Bucket,
  projectId: string,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
        _type: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
        _key: generateEntityKey({
          type: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
          id: data.name as string,
        }),
        id: data.id as string,
        name: data.name,
        displayName: data.name as string,
        storageClass: data.storageClass,
        createdOn: getTime(data.timeCreated),
        updatedOn: getTime(data.updated),
        // Storage buckets are encrypted by default
        encrypted: true,
        // If not set, we are using the default Google Encryption key
        encryptionKeyRef: data.encryption?.defaultKmsKeyName,
        // https://cloud.google.com/storage/docs/uniform-bucket-level-access
        uniformBucketLevelAccess:
          data.iamConfiguration?.uniformBucketLevelAccess?.enabled === true,
        // Rely on the value of the classification tag
        classification: null,
        etag: data.etag,
        webLink: getCloudStorageBucketWebLink(data, projectId),
      },
    },
  });
}
