import { CloudStorageClient } from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { createCloudStorageBucketEntity } from './converters';
import { StorageStepsSpec, StorageEntitiesSpec } from './constants';
import { storage_v1 } from 'googleapis';
import {
  publishMissingPermissionEvent,
  publishUnprocessedBucketsEvent,
} from '../../utils/events';
import { OrgPolicyClient } from '../orgpolicy/client';
import { isMemberPublic } from '../../utils/iam';

type iamConfiguration = {
  bucketPolicyOnly?: {
    enabled?: boolean;
    lockedTime?: string;
  };
  publicAccessPrevention?: string;
  uniformBucketLevelAccess?: {
    enabled?: boolean;
    lockedTime?: string;
  };
} | null;

export enum BucketAccess {
  NOT_PUBLIC = 'Not public',
  SUBJECT_TO_OBJECT_ACLS = 'Subject to object ACLs',
  PUBLIC_TO_INTERNET = 'Public to internet',
}

function isSubjectToObjectAcls(
  iamConfiguration: iamConfiguration,
  publicPolicy: boolean,
) {
  return (
    iamConfiguration?.uniformBucketLevelAccess?.enabled !== true &&
    !publicPolicy
  );
}

function getUsesEnforcedPublicAccessPrevention(
  iamConfiguration: iamConfiguration,
) {
  return iamConfiguration?.publicAccessPrevention === 'enforced';
}

function isBucketPolicyPublicAccess(
  bucketPolicy: storage_v1.Schema$Policy,
): boolean {
  for (const binding of bucketPolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export function getPublicState({
  bucketPolicy,
  publicAccessPreventionPolicy,
  iamConfiguration,
}: {
  bucketPolicy?: storage_v1.Schema$Policy;
  publicAccessPreventionPolicy?: boolean;
  iamConfiguration?: iamConfiguration;
}): {
  isPublicBucket: boolean | undefined;
  access: BucketAccess | undefined;
} {
  // if publicAccessPreventionPolicy == undefined - we couldn't get the step to run, so we return undefined (it's unsafe to just guess)
  if (publicAccessPreventionPolicy === undefined) {
    return {
      access: undefined,
      isPublicBucket: undefined,
    };
  }

  let hasOpenBucketPolicies = false;
  let isObjectAcl = false;
  let usesEnforcedPublicAccessPrevention = false;
  let access: BucketAccess;

  if (bucketPolicy) {
    hasOpenBucketPolicies = isBucketPolicyPublicAccess(bucketPolicy);
  }

  if (iamConfiguration) {
    isObjectAcl = isSubjectToObjectAcls(
      iamConfiguration,
      hasOpenBucketPolicies,
    );
    usesEnforcedPublicAccessPrevention =
      getUsesEnforcedPublicAccessPrevention(iamConfiguration);
  }

  /*
   * - Public to internet means one or more bucket-level permissions grant access to allUsers or allAuthenticatedUsers.
   *
   * - Subject to object ACLs means fine-grained, object-level access control lists (ACLs) are enabled. Objects may be
   *   public if they grant access to allUsers or allAuthenticatedUsers.
   *
   * - Not public means the bucket’s policy controls all objects uniformly, and no permissions have been granted to allUsers
   *   or allAuthenticatedUsers.
   */

  if (hasOpenBucketPolicies && !publicAccessPreventionPolicy) {
    access = BucketAccess.PUBLIC_TO_INTERNET;
  } else if (
    isObjectAcl &&
    !usesEnforcedPublicAccessPrevention &&
    !publicAccessPreventionPolicy
  ) {
    access = BucketAccess.SUBJECT_TO_OBJECT_ACLS;
  } else {
    access = BucketAccess.NOT_PUBLIC;
  }

  const isPublicBucket =
    (hasOpenBucketPolicies || isObjectAcl) &&
    !usesEnforcedPublicAccessPrevention &&
    !publicAccessPreventionPolicy;

  return {
    isPublicBucket,
    access,
  };
}

export async function fetchStorageBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new CloudStorageClient({ config }, logger);
  const orgPolicyClient = new OrgPolicyClient({ config }, logger);

  let publicAccessPreventionPolicy: boolean | undefined = undefined;

  try {
    publicAccessPreventionPolicy =
      await orgPolicyClient.fetchOrganizationPublicAccessPreventionPolicy();
  } catch (err) {
    logger.warn(
      { err },
      'Error fetching organization public access prevention policy',
    );

    if (
      err.code === 403 &&
      (err.message as string).includes(
        `Permission 'orgpolicy.policy.get' denied on resource`,
      )
    ) {
      publishMissingPermissionEvent({
        logger,
        permission: 'orgpolicy.policy.get',
        stepId: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
      });
    }
  }

  const bucketIdsWithUnprocessedPolicies: string[] = [];
  await client.iterateCloudStorageBuckets(async (bucket) => {
    const bucketId = bucket.id as string;

    let bucketPolicy: storage_v1.Schema$Policy | undefined;
    try {
      bucketPolicy = await client.getPolicy(bucketId);
    } catch (err) {
      if (
        err.message ===
        'Bucket is requester pays bucket but no user project provided.'
      ) {
        bucketIdsWithUnprocessedPolicies.push(bucketId);
      } else {
        throw err;
      }
    }

    const { access, isPublicBucket } = getPublicState({
      bucketPolicy,
      publicAccessPreventionPolicy,
      iamConfiguration: bucket.iamConfiguration,
    });

    const bucketEntity = createCloudStorageBucketEntity({
      data: bucket,
      projectId: config.serviceAccountKeyConfig.project_id,
      isPublicBucket,
      access,
    });

    await jobState.addEntity(bucketEntity);
  });

  // NOTE: Being unable to process "requestor pays" buckets is a non-fatal error,
  // and should _not_ cause dependent steps from running.
  //
  // See here for more info: https://cloud.google.com/storage/docs/requester-pays
  if (bucketIdsWithUnprocessedPolicies.length) {
    logger.info(
      {
        numUnprocessedBucketPolicies: bucketIdsWithUnprocessedPolicies.length,
      },
      'Unprocessed bucket policies due to being configured with "requestor pays"',
    );

    publishUnprocessedBucketsEvent({
      logger,
      bucketIdsWithUnprocessedPolicies,
    });
  }
}

export const storageSteps: GoogleCloudIntegrationStep[] = [
  {
    id: StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    name: StorageStepsSpec.FETCH_STORAGE_BUCKETS.name,
    entities: [StorageEntitiesSpec.STORAGE_BUCKET],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchStorageBuckets,
    permissions: [
      'orgpolicy.policies.list',
      'orgpolicy.policy.get',
      'storage.buckets.list',
      'storage.buckets.getIamPolicy',
    ],
    apis: ['orgpolicy.googleapis.com', 'storage.googleapis.com'],
  },
];
