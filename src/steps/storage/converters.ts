import { storage_v1 } from 'googleapis';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  CLOUD_STORAGE_BUCKET_ENTITY_CLASS,
} from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { NearestOrgPolicyResult, OrgPolicyResult } from '../orgpolicy';

export function getCloudStorageBucketWebLink(
  data: storage_v1.Schema$Bucket,
  projectId: string,
) {
  return `https://console.cloud.google.com/storage/browser/${data.name};tab=objects?forceOnBucketsSortingFiltering=false&project=${projectId}`;
}

export function getCloudStorageBucketKey(id: string) {
  return `bucket:${id}`;
}

function getPublicState(
  accessPreventionPolicy: OrgPolicyResult | undefined,
  isPublic: boolean | undefined,
  isSubjectToObjectAcls: boolean,
) {
  if (accessPreventionPolicy === undefined) {
    // The step responsible for fetching access prevention policies didn't run correctly so we can't know for sure
    return undefined;
  }

  if (
    accessPreventionPolicy.result === NearestOrgPolicyResult.FOUND &&
    accessPreventionPolicy.organizationPolicy?.spec?.rules
  ) {
    if (
      accessPreventionPolicy.organizationPolicy?.spec?.rules[0].enforce === true
    ) {
      // Prevention access policy is found, it's enforced, meaning no bucket is publicly accessible
      return false;
    } else {
      // Prevention access policy is found, but it's not enforced, meaning we fallback to previous code for checking
      return isPublic || isSubjectToObjectAcls;
    }
  }

  if (accessPreventionPolicy.result === NearestOrgPolicyResult.NOT_FOUND) {
    // Prevention access policy wasn't found, meaning we fallback to previous code for checking
    return isPublic || isSubjectToObjectAcls;
  }
}

export function createCloudStorageBucketEntity({
  data,
  projectId,
  isPublic,
  publicAccessPrevention,
}: {
  data: storage_v1.Schema$Bucket;
  projectId: string;
  isPublic?: boolean;
  publicAccessPrevention: OrgPolicyResult | undefined;
}) {
  const isSubjectToObjectAcls =
    data.iamConfiguration?.uniformBucketLevelAccess?.enabled !== true &&
    !isPublic;

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
        /**
         * It is not possible to know if bucket is public or not when uniformBucketLevelAccess is not enabled
         * as when it is not enabled, each item in the google_storage_bucket is subject to its own Access
         * Control List (ACL) which may or may not be open to the internet. Ingesting the ACLs of every
         * element in a storage bucket is far too large a task for this integration.
         *
         * Ref: https://cloud.google.com/storage/docs/cloud-console?&_ga=2.84754521.-1526178294.1622832983&_gac=1.262728446.1626996208.CjwKCAjwruSHBhAtEiwA_qCppsTtaBT90RDQ-e9xjNnNQM0lwd2aI9wJfUhrVgFjQ0_SDu4kR1yUDhoCeRwQAvD_BwE#_sharingdata
         */
        public: getPublicState(
          publicAccessPrevention,
          isPublic,
          isSubjectToObjectAcls,
        ),
        isSubjectToObjectAcls,
        versioningEnabled: data.versioning?.enabled === true,
        // Rely on the value of the classification tag
        classification: null,
        etag: data.etag,
        webLink: getCloudStorageBucketWebLink(data, projectId),
      },
    },
  });
}
