import {
  JobState,
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  RelationshipDirection,
  getRawData,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';
import { ComputeClient } from './client';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import {
  createComputeDiskEntity,
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
  createComputeNetworkEntity,
  createComputeSubnetEntity,
  createComputeFirewallEntity,
  createSubnetHasComputeInstanceRelationship,
  createFirewallRuleMappedRelationship,
  createComputeProjectEntity,
  createLoadBalancerEntity,
  createBackendServiceEntity,
  createBackendBucketEntity,
  createTargetHttpsProxyEntity,
  createTargetSslProxyEntity,
  createTargetHttpProxyEntity,
  createSslPolicyEntity,
  createInstanceGroupEntity,
  createHealthCheckEntity,
  createInstanceGroupNamedPortEntity,
  createComputeImageEntity,
  createComputeSnapshotEntity,
  createComputeAddressEntity,
  createComputeForwardingRuleEntity,
  createRegionBackendServiceEntity,
  createRegionInstanceGroupEntity,
  createRegionHealthCheckEntity,
  createComputeRegionDiskEntity,
  createRegionLoadBalancerEntity,
  createRegionTargetHttpsProxyEntity,
  createRegionTargetHttpProxyEntity,
  createComputeGlobalForwardingRuleEntity,
  createComputeGlobalAddressEntity,
} from './converters';
import {
  STEP_COMPUTE_INSTANCES,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  STEP_COMPUTE_DISKS,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK,
  ENTITY_CLASS_COMPUTE_INSTANCE,
  ENTITY_CLASS_COMPUTE_DISK,
  STEP_COMPUTE_NETWORKS,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_CLASS_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_CLASS_COMPUTE_SUBNETWORK,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_FIREWALLS,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_CLASS_COMPUTE_FIREWALL,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT,
  RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
  RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE,
  RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
  RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
  STEP_COMPUTE_PROJECT,
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_CLASS_COMPUTE_PROJECT,
  RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
  STEP_COMPUTE_LOADBALANCERS,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_BACKEND_BUCKETS,
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  ENTITY_CLASS_COMPUTE_BACKEND_BUCKET,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_BUCKET,
  RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET,
  STEP_COMPUTE_TARGET_SSL_PROXIES,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
  ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_TARGET_SSL_PROXY,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_SSL_POLICY,
  ENTITY_CLASS_COMPUTE_SSL_POLICY,
  STEP_COMPUTE_SSL_POLICIES,
  RELATIONSHIP_TYPE_TARGET_HTTPS_PROXY_HAS_SSL_POLICY,
  RELATIONSHIP_TYPE_TARGET_SSL_PROXY_HAS_SSL_POLICY,
  STEP_COMPUTE_INSTANCE_GROUPS,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
  RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_COMPUTE_INSTANCE,
  STEP_COMPUTE_HEALTH_CHECKS,
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
  RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
  STEP_COMPUTE_IMAGES,
  ENTITY_TYPE_COMPUTE_IMAGE,
  ENTITY_CLASS_COMPUTE_IMAGE,
  RELATIONSHIP_TYPE_DISK_USES_IMAGE,
  RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY,
  RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY,
  ENTITY_TYPE_COMPUTE_SNAPSHOT,
  ENTITY_CLASS_COMPUTE_SNAPSHOT,
  STEP_COMPUTE_SNAPSHOTS,
  RELATIONSHIP_TYPE_IMAGE_CREATED_IMAGE,
  STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
  STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
  RELATIONSHIP_TYPE_DISK_CREATED_SNAPSHOT,
  RELATIONSHIP_TYPE_SNAPSHOT_CREATED_IMAGE,
  STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
  STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_COMPUTE_ADDRESSES,
  ENTITY_TYPE_COMPUTE_ADDRESS,
  ENTITY_CLASS_COMPUTE_ADDRESS,
  STEP_COMPUTE_FORWARDING_RULES,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  ENTITY_CLASS_COMPUTE_FORWARDING_RULE,
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
  ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
  ENTITY_CLASS_COMPUTE_GLOBAL_FORWARDING_RULE,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
  STEP_COMPUTE_REGION_DISKS,
  STEP_COMPUTE_REGION_LOADBALANCERS,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_USES_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_INSTANCE_USES_ADDRESS,
  STEP_COMPUTE_GLOBAL_ADDRESSES,
  ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
  ENTITY_CLASS_COMPUTE_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
  RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
  STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
  STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
  STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
} from './constants';
import { compute_v1, osconfig_v1 } from 'googleapis';
import { INTERNET, RelationshipClass } from '@jupiterone/data-model';
import {
  STEP_IAM_SERVICE_ACCOUNTS,
  IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
} from '../iam';
import {
  getFirewallIpRanges,
  getFirewallRelationshipDirection,
  processFirewallRuleRelationshipTargets,
} from '../../utils/firewall';
import { getCloudStorageBucketKey } from '../storage/converters';
import { publishMissingPermissionEvent } from '../../utils/events';
import { parseRegionNameFromRegionUrl } from '../../google-cloud/regions';
import {
  ENTITY_TYPE_KMS_KEY,
  STEP_CLOUD_KMS_KEYS,
  STEP_CLOUD_KMS_KEY_RINGS,
} from '../kms';
import { isMemberPublic } from '../../utils/iam';
import { getKmsGraphObjectKeyFromKmsKeyName } from '../../utils/kms';
import {
  getComputeInstanceServiceAccountData,
  getNetworkPeerings,
  getPeeredNetworks,
  setComputeInstanceServiceAccountData,
  setNetworkPeerings,
  setPeeredNetworks,
} from '../../utils/jobState';
import { StorageEntitiesSpec, StorageStepsSpec } from '../storage/constants';

export * from './constants';

function createComputeClient(
  context: IntegrationStepContext,
  logger: IntegrationLogger,
) {
  const client = new ComputeClient(
    {
      config: context.instance.config,
      onRetry(err) {
        context.logger.info({ err }, 'Retrying API call');
      },
    },
    logger,
  );

  return client;
}

function isComputeImagePublicAccess(
  imagePolicy: compute_v1.Schema$Policy,
): boolean {
  for (const binding of imagePolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

async function iterateComputeInstanceDisks(params: {
  jobState: JobState;
  computeInstanceEntity: Entity;
  computeInstance: compute_v1.Schema$Instance;
}) {
  const { jobState, computeInstanceEntity, computeInstance } = params;

  for (const disk of computeInstance.disks || []) {
    if (!disk.source) {
      // NOTE: Currently, we are only building relationships disks that were
      // created externally. Not local devices. We should also create entities
      // for local devices.
      continue;
    }

    // TODO: Also figure out how to build relationships to source snapshot and
    // source image? Is that even possible?

    const diskKey = await jobState.getData<string>(`disk:${disk.source}`);

    if (!diskKey) {
      continue;
    } else {
      // TODO: Mapped relationship to selfLink property? (disk.source as val)
    }

    const computeDiskEntity = await jobState.findEntity(diskKey);

    if (!computeDiskEntity) {
      continue;
    }

    await jobState.addRelationship(
      createComputeInstanceUsesComputeDiskRelationship({
        computeInstanceEntity,
        computeDiskEntity,
        mode: disk.mode,
        autoDelete: disk.autoDelete,
        deviceName: disk.deviceName,
        interface: disk.interface,
      }),
    );
  }
}

async function iterateComputeInstanceNetworkInterfaces(params: {
  jobState: JobState;
  computeInstanceEntity: Entity;
  computeInstance: compute_v1.Schema$Instance;
}) {
  const { jobState, computeInstanceEntity, computeInstance } = params;

  for (const networkInterface of computeInstance.networkInterfaces || []) {
    const subnetwork = networkInterface.subnetwork as string;

    const subnetEntity = await jobState.findEntity(subnetwork);

    if (!subnetEntity) {
      continue;
    }

    await jobState.addRelationship(
      createSubnetHasComputeInstanceRelationship({
        subnetEntity,
        computeInstanceEntity,
        networkInterface,
      }),
    );
  }
}

export async function fetchComputeProject(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  let computeProject: compute_v1.Schema$Project;

  try {
    computeProject = await client.fetchComputeProject();
  } catch (err) {
    if (err.code === 403) {
      logger.warn(
        { err },
        'Could not fetch compute project. Requires additional permission',
      );

      publishMissingPermissionEvent({
        logger,
        permission: 'compute.projects.get',
        stepId: STEP_COMPUTE_PROJECT,
      });

      return;
    }

    throw err;
  }

  if (computeProject) {
    const computeProjectEntity = createComputeProjectEntity(computeProject);
    await jobState.addEntity(computeProjectEntity);

    await jobState.iterateEntities(
      {
        _type: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
      async (computeInstanceEntity) => {
        // Add relationships to all instances but the one starting with 'gke' because GKE are handled separately
        if (!computeInstanceEntity.displayName?.startsWith('gke')) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: computeProjectEntity,
              to: computeInstanceEntity,
            }),
          );
        }
      },
    );
  }
}

// Region disks can't use image as source (only snapshots)
export async function fetchComputeRegionDisks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateComputeRegionDisks(async (disk) => {
    const diskEntity = createComputeRegionDiskEntity(disk, client.projectId);
    await jobState.addEntity(diskEntity);
  });
}

export async function fetchComputeDisks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateComputeDisks(async (disk) => {
    await jobState.setData(`disk:${disk.selfLink}`, `disk:${disk.id}`);

    await jobState.addEntity(createComputeDiskEntity(disk, client.projectId));
  });
}

// Note: this builds relationships for both disk and region disk
export async function buildDiskUsesKmsRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_DISK },
    async (diskEntity) => {
      const instance = getRawData<compute_v1.Schema$Disk>(diskEntity);
      if (!instance) {
        logger.warn(
          {
            _key: diskEntity._key,
          },
          'Could not find raw data on disk instance entity',
        );
        return;
      }

      const kmsKeyName = instance.diskEncryptionKey?.kmsKeyName;
      if (!kmsKeyName) {
        return;
      }

      const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName);
      const kmsKeyEntity = await jobState.findEntity(kmsKey);

      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: diskEntity,
            to: kmsKeyEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.USES,
            _type: RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: diskEntity._key,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                _type: ENTITY_TYPE_KMS_KEY,
                _key: kmsKey,
              },
            },
          }),
        );
      }
    },
  );
}

export async function buildDiskImageRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_DISK },
    async (
      diskEntity: {
        sourceImage?: string | null;
      } & Entity,
    ) => {
      if (diskEntity.sourceImage) {
        // disk.sourceImage looks like this:
        // https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/global/images/my-custom-image
        // https://www.googleapis.com/compute/v1/projects/ubuntu-os-cloud/global/images/ubuntu-1804-bionic-v20210211
        // ProjectId part can be good separator between public and custom images and is necessary for images.get API call
        const sourceImageProjectId = diskEntity.sourceImage?.split('/')[6];
        const sourceImageName = diskEntity.sourceImage?.split('/')[9];

        if (sourceImageProjectId === client.projectId) {
          // Custom image case
          const imageEntity = await jobState.findEntity(diskEntity.sourceImage);
          if (imageEntity) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.USES,
                from: diskEntity,
                to: imageEntity,
              }),
            );
          }
        } else {
          // Public image case
          let image: compute_v1.Schema$Image;

          try {
            image = await client.fetchComputeImage(
              sourceImageName as string,
              sourceImageProjectId as string,
            );
          } catch (err) {
            if (err.code === 403) {
              logger.warn(
                { err },
                'Could not fetch compute image. Requires additional permission',
              );

              publishMissingPermissionEvent({
                logger,
                permission: 'compute.images.get',
                stepId: STEP_COMPUTE_DISKS,
              });

              return;
            } else if (err.code === 404) {
              logger.info(
                { err, sourceImageName },
                `The public image cannot be found, it's most likely deprecated`,
              );

              return;
            } else {
              throw err;
            }
          }

          if (image) {
            // iamPolicy can't be fetched for public images/nor can it be changed (expected)
            const imageEntity = createComputeImageEntity({
              data: image,
              isPublic: true,
            });

            await jobState.addRelationship(
              createMappedRelationship({
                _class: RelationshipClass.USES,
                _type: RELATIONSHIP_TYPE_DISK_USES_IMAGE,
                _mapping: {
                  relationshipDirection: RelationshipDirection.FORWARD,
                  sourceEntityKey: diskEntity._key,
                  targetFilterKeys: [['_type', '_key']],
                  targetEntity: {
                    ...imageEntity,
                    _rawData: undefined,
                  },
                },
              }),
            );
          }
        }
      }
    },
  );
}

export async function fetchComputeSnapshots(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateComputeSnapshots(async (snapshot) => {
    await jobState.addEntity(createComputeSnapshotEntity(snapshot));
  });
}

export async function buildComputeSnapshotDiskRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_COMPUTE_SNAPSHOT,
    },
    async (snapshotEntity) => {
      const sourceDiskId = snapshotEntity.sourceDiskId as string | undefined;

      if (!sourceDiskId) {
        return;
      }

      const sourceDiskEntity = await jobState.findEntity(
        `disk:${sourceDiskId}`,
      );

      if (sourceDiskEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CREATED,
            from: sourceDiskEntity,
            to: snapshotEntity,
          }),
        );
      } else {
        // TODO: Mapped relationship? I'm not sure whether it's possible for a
        // snapshot to reference a source disk from another project.
      }
    },
  );
}

export async function buildImageUsesKmsRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_IMAGE },
    async (imageEntity) => {
      const instance = getRawData<compute_v1.Schema$Image>(imageEntity);
      if (!instance) {
        logger.warn(
          {
            _key: imageEntity._key,
          },
          'Could not find raw data on image instance entity',
        );
        return;
      }

      const kmsKeyName = instance.imageEncryptionKey?.kmsKeyName;
      if (!kmsKeyName) {
        return;
      }

      const kmsKey = getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName);
      const kmsKeyEntity = await jobState.findEntity(kmsKey);

      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: imageEntity,
            to: kmsKeyEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.USES,
            _type: RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: imageEntity._key,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                _type: ENTITY_TYPE_KMS_KEY,
                _key: kmsKey,
              },
            },
          }),
        );
      }
    },
  );
}

export async function fetchComputeImages(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateCustomComputeImages(async (image) => {
    const imagePolicy = await client.fetchComputeImagePolicy(
      image.name as string,
    );
    const imageEntity = createComputeImageEntity({
      data: image,
      isPublic: isComputeImagePublicAccess(imagePolicy),
    });
    await jobState.addEntity(imageEntity);

    if (image.sourceSnapshotId) {
      const sourceSnapshotEntity = await jobState.findEntity(
        `snapshot:${image.sourceSnapshotId}`,
      );

      if (sourceSnapshotEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CREATED,
            from: sourceSnapshotEntity,
            to: imageEntity,
          }),
        );
      } else {
        // TODO: Mapped relationship?
      }
    }
  });
}

export async function buildImageCreatedImageRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;

  await jobState.iterateEntities(
    {
      _type: ENTITY_TYPE_COMPUTE_IMAGE,
    },
    async (imageEntity) => {
      const sourceImageId = imageEntity.sourceImageId as string | undefined;

      if (!sourceImageId) {
        return;
      }

      const sourceImageKey = imageEntity._key;

      const sourceImageEntity = await jobState.findEntity(sourceImageKey);

      if (sourceImageEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CREATED,
            from: sourceImageEntity,
            to: imageEntity,
          }),
        );
      } else {
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.CREATED,
            _type: RELATIONSHIP_TYPE_IMAGE_CREATED_IMAGE,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: sourceImageKey,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                ...imageEntity,
                _rawData: undefined,
              },
            },
          }),
        );
      }
    },
  );
}

export async function fetchComputeInstances(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);
  const computeInstanceKeyToServiceAccountDataMap = new Map<
    string,
    compute_v1.Schema$ServiceAccount[]
  >();

  let inventoryApiDisabled = false;

  await client.iterateComputeInstances(async (computeInstance) => {
    let instanceInventory: osconfig_v1.Schema$Inventory | undefined;

    try {
      if (computeInstance.zone && !inventoryApiDisabled) {
        instanceInventory = await client.fetchComputeInstanceInventory(
          computeInstance.zone?.split('/')[8],
          computeInstance.id!,
        );
      }
    } catch (e) {
      // Do not make this inventory call if api is disabled and customer is not using this feature.
      if (e.response.status === 403) {
        inventoryApiDisabled = true;
      }

      if (e.response.status === 404) {
        context.logger.debug(
          `Compute instance ${computeInstance.name} inventory entity not found.`,
        );
      } else {
        context.logger.warn(
          { e },
          `Error fetching compute instance ${computeInstance.name} inventory.`,
        );
      }
    }
    const computeInstanceEntity = await jobState.addEntity(
      createComputeInstanceEntity(
        computeInstance,
        instanceInventory,
        client.projectId,
      ),
    );

    /**
     * Google Cloud Docs ref:
     *
     * Only one service account per VM instance is supported. Service accounts
     * generate access tokens that can be accessed through the metadata server and
     * used to authenticate applications on the instance.
     *
     * NOTE: Regardless of the fact that the GCP docs explicitly mention that
     * only a single SA is supported today, the value of `serviceAccounts` is
     * an array, which means that they may support more than one in the future.
     */
    if (computeInstance.serviceAccounts?.length) {
      computeInstanceKeyToServiceAccountDataMap.set(
        computeInstanceEntity._key,
        computeInstance.serviceAccounts,
      );
    }

    await iterateComputeInstanceDisks({
      jobState,
      computeInstanceEntity,
      computeInstance,
    });

    await iterateComputeInstanceNetworkInterfaces({
      jobState,
      computeInstance,
      computeInstanceEntity,
    });

    // If this instance is managed by instance-group, add relationship
    const createdBy = computeInstance.metadata?.items?.find(
      (item) => item.key === 'created-by',
    )?.value;
    if (
      createdBy &&
      createdBy.includes('instanceGroupManagers') &&
      createdBy.split('/').length >= 5
    ) {
      /*
        Some explanation (not a fan of doing this but):
        Our instanceGroup entities use the selfLink for the _key which looks something like this:
        "selfLink": "https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-300716/zones/us-central1-a/instanceGroups/instance-group-1",

        Here we want to find the correct instanceGroup based on compute instance data and formats sadly do not map 1-to-1.
        Compute instance gives us the following form:
        'projects/165882964161/zones/us-central1-a/instanceGroupManagers/instance-group-1'

        So we're building the selfLink format below so that we can use jobState.findEntity(that value) instead of having to iterateEntities and check that way
        Both would work. Perhaps there's a better way to do this and if so we'll refactor it, but for now this allows us to make the relationship
      */
      const zone = createdBy.split('/')[3];
      const instanceGroupName = createdBy.split('/')[5];
      const projectId = computeInstance.zone?.split('/')[6];
      const instanceGroupKey = `https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instanceGroups/${instanceGroupName}`;

      const instanceGroupEntity = await jobState.findEntity(instanceGroupKey);

      if (instanceGroupEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: instanceGroupEntity,
            to: computeInstanceEntity,
          }),
        );
      }
    }
  });

  await setComputeInstanceServiceAccountData(
    jobState,
    computeInstanceKeyToServiceAccountDataMap,
  );
}

export async function buildComputeInstanceServiceAccountRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState } = context;
  const computeInstanceServiceAccountData =
    await getComputeInstanceServiceAccountData(jobState);

  if (!computeInstanceServiceAccountData) {
    // This should never happen because of the step dependency graph
    context.logger.error(
      'Compute instance and service account relationships attempted to be built before possible',
    );
    return;
  }

  for (const [
    computeInstanceKey,
    serviceAccountData,
  ] of computeInstanceServiceAccountData) {
    for (const { email, scopes } of serviceAccountData) {
      const serviceAccountEntity = await jobState.findEntity(email!);

      if (!serviceAccountEntity) {
        // TODO: Should we create a mapped relationship here?
        continue;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.TRUSTS,
          fromKey: computeInstanceKey,
          fromType: ENTITY_TYPE_COMPUTE_INSTANCE,
          toKey: serviceAccountEntity._key,
          toType: serviceAccountEntity._type,
          properties: {
            scopes: scopes && `[${scopes.join(',')}]`,
          },
        }),
      );
    }
  }
}

export async function processFirewallRuleLists({
  jobState,
  firewall,
  firewallEntity,
}: {
  jobState: JobState;
  firewall: compute_v1.Schema$Firewall;
  firewallEntity: Entity;
}) {
  const ipRanges = getFirewallIpRanges(firewall);
  const relationshipDirection = getFirewallRelationshipDirection(firewall);

  for (const [ruleIndex, rule] of (firewall.allowed || []).entries()) {
    await processFirewallRuleRelationshipTargets({
      ruleIndex,
      rule,
      ipRanges,
      callback: async (processedRuleTarget) => {
        await jobState.addRelationship(
          createFirewallRuleMappedRelationship({
            _class: RelationshipClass.ALLOWS,
            relationshipDirection,
            firewallEntity,
            ...processedRuleTarget,
          }),
        );
      },
    });
  }

  for (const [ruleIndex, rule] of (firewall.denied || []).entries()) {
    await processFirewallRuleRelationshipTargets({
      ruleIndex,
      rule,
      ipRanges,
      callback: async (processedRuleTarget) => {
        await jobState.addRelationship(
          createFirewallRuleMappedRelationship({
            _class: RelationshipClass.DENIES,
            relationshipDirection,
            firewallEntity,
            ...processedRuleTarget,
          }),
        );
      },
    });
  }
}

export async function fetchComputeFirewalls(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateFirewalls(async (firewall) => {
    const firewallEntity = await jobState.addEntity(
      createComputeFirewallEntity(firewall),
    );

    const networkEntity = await jobState.findEntity(firewall.network as string);

    if (!networkEntity) {
      // Possible that the network was created after the network entities were
      // created.
      return;
    }

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.PROTECTS,
        from: firewallEntity,
        to: networkEntity,
      }),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: networkEntity,
        to: firewallEntity,
      }),
    );

    await processFirewallRuleLists({
      jobState,
      firewall,
      firewallEntity,
    });
  });
}

export async function fetchComputeSubnetworks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateSubnetworks(async (subnet) => {
    const subnetEntity = await jobState.addEntity(
      createComputeSubnetEntity(subnet, client.projectId),
    );

    const networkEntity = await jobState.findEntity(subnet.network as string);

    if (!networkEntity) {
      // Possible that the network was created after the network entities were
      // created.
      return;
    }

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.CONTAINS,
        from: networkEntity,
        to: subnetEntity,
      }),
    );
  });
}

export async function fetchComputeGlobalAddresses(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateComputeGlobalAddresses(async (address) => {
    const addressEntity = createComputeGlobalAddressEntity(
      address,
      client.projectId,
    );
    await jobState.addEntity(addressEntity);

    // Subnetwork -> HAS -> Compute Address
    if (address.subnetwork) {
      const subnetworkEntity = await jobState.findEntity(address.subnetwork);
      if (subnetworkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: subnetworkEntity,
            to: addressEntity,
          }),
        );
      }
    }

    // Network -> HAS -> Compute Address (might be redundant because Network -> HAS -> Subnetwork?)
    if (address.network) {
      const networkEntity = await jobState.findEntity(address.network);
      if (networkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: networkEntity,
            to: addressEntity,
          }),
        );
      }
    }
  });
}

export async function fetchComputeAddresses(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateComputeAddresses(async (address) => {
    const addressEntity = await jobState.addEntity(
      createComputeAddressEntity(address, client.projectId),
    );

    // Subnetwork -> HAS -> Compute Address
    if (address.subnetwork) {
      const subnetworkEntity = await jobState.findEntity(address.subnetwork);
      if (subnetworkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: subnetworkEntity,
            to: addressEntity,
          }),
        );
      }
    }

    // Network -> HAS -> Compute Address (might be redundant because Network -> HAS -> Subnetwork?)
    if (address.network) {
      const networkEntity = await jobState.findEntity(address.network);
      if (networkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: networkEntity,
            to: addressEntity,
          }),
        );
      }
    }

    // *Some* resource is using the address (address's users' array contains selfLinks)
    // Right now we know (from examples) that those resources include: Instance, ForwardingRule (non-region type)
    // There may be more, we can keep adding here
    if (address.users) {
      for (const user of address.users) {
        const resourceUser = await jobState.findEntity(user);
        if (resourceUser) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.USES,
              from: resourceUser,
              to: addressEntity,
            }),
          );
        }
      }
    }
  });
}

// Depending on the load balancer and its tier, a forwarding rule is either global or regional.
// Terraform calls it "google_compute_forwarding_rule" not "google_compute_region_forwarding_rule"
// We're doing the same here
export async function fetchComputeForwardingRules(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateForwardingRules(async (forwardingRule) => {
    const forwardingRuleEntity =
      createComputeForwardingRuleEntity(forwardingRule);
    await jobState.addEntity(forwardingRuleEntity);

    // This is a *region* backend service
    if (forwardingRule.backendService) {
      const backendServiceEntity = await jobState.findEntity(
        forwardingRule.backendService,
      );
      if (backendServiceEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: backendServiceEntity,
          }),
        );
      }
    }

    if (forwardingRule.subnetwork) {
      const subnetworkEntity = await jobState.findEntity(
        forwardingRule.subnetwork,
      );
      if (subnetworkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: subnetworkEntity,
          }),
        );
      }
    }

    if (forwardingRule.network) {
      const networkEntity = await jobState.findEntity(forwardingRule.network);
      if (networkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: networkEntity,
          }),
        );
      }
    }

    // The target can be target proxy or target pool
    // Future: We may need to expect proxy SSL type here too
    // Future: We also may want to ingest google_compute_target_pool so that we can build a relationship with it here
    if (forwardingRule.target) {
      const targetEntity = await jobState.findEntity(forwardingRule.target);
      if (targetEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: targetEntity,
          }),
        );
      }
    }
  });
}

export async function fetchComputeGlobalForwardingRules(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateGlobalForwardingRules(async (forwardingRule) => {
    const forwardingRuleEntity =
      createComputeGlobalForwardingRuleEntity(forwardingRule);
    await jobState.addEntity(forwardingRuleEntity);

    // Should be non-region backend service (requires more testing to be 100% sure)
    if (forwardingRule.backendService) {
      const backendServiceEntity = await jobState.findEntity(
        forwardingRule.backendService,
      );
      if (backendServiceEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: backendServiceEntity,
          }),
        );
      }
    }

    if (forwardingRule.subnetwork) {
      const subnetworkEntity = await jobState.findEntity(
        forwardingRule.subnetwork,
      );
      if (subnetworkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: subnetworkEntity,
          }),
        );
      }
    }

    if (forwardingRule.network) {
      const networkEntity = await jobState.findEntity(forwardingRule.network);
      if (networkEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: networkEntity,
          }),
        );
      }
    }

    // The target can be target proxy or target pool
    // Future: We may need to expect proxy SSL type here too
    // Future: We also may want to ingest google_compute_target_pool so that we can build a relationship with it here
    if (forwardingRule.target) {
      const targetEntity = await jobState.findEntity(forwardingRule.target);
      if (targetEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: forwardingRuleEntity,
            to: targetEntity,
          }),
        );
      }
    }
  });
}

export async function fetchComputeNetworks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  const peeredNetworks: string[] = [];

  await client.iterateNetworks(async (network) => {
    await jobState.addEntity(
      createComputeNetworkEntity(network, client.projectId),
    );

    if (network.peerings?.length) {
      await setNetworkPeerings(
        jobState,
        network.selfLink as string,
        network.peerings || [],
      );
      peeredNetworks.push(network.selfLink as string);
    }
  });

  await setPeeredNetworks(jobState, peeredNetworks);
}

function buildPeeringNetworkRelationshipProperties(
  networkPeering: compute_v1.Schema$NetworkPeering,
) {
  return {
    active: networkPeering.state === 'ACTIVE',
    autoCreateRoutes: networkPeering.autoCreateRoutes,
    exportCustomRoutes: networkPeering.exportCustomRoutes,
    importCustomRoutes: networkPeering.importCustomRoutes,
    exchangeSubnetRoutes: networkPeering.exchangeSubnetRoutes,
    exportSubnetRoutesWithPublicIp:
      networkPeering.exportSubnetRoutesWithPublicIp,
    importSubnetRoutesWithPublicIp:
      networkPeering.importSubnetRoutesWithPublicIp,
  };
}

export async function buildComputeNetworkPeeringRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;

  const peeredNetworks = await getPeeredNetworks(jobState);
  for (const network of peeredNetworks || []) {
    const networkPeerings = await getNetworkPeerings(jobState, network);
    for (const networkPeering of networkPeerings || []) {
      const sourceNetwork = await jobState.findEntity(network);
      if (!sourceNetwork) {
        return;
      }

      if (
        networkPeering?.network?.split('/')[6] === instance.config.projectId
      ) {
        const targetNetwork = await jobState.findEntity(
          networkPeering.network as string,
        );
        if (!targetNetwork) {
          return;
        }

        // VPC network peering exists within this project, build direct relationship
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONNECTS,
            from: sourceNetwork,
            to: targetNetwork,
            properties: {
              ...buildPeeringNetworkRelationshipProperties(networkPeering),
            },
          }),
        );
      } else {
        // VPC network peering exists across projects, build mapped relationship
        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.CONNECTS,
            _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: sourceNetwork._key,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                _type: ENTITY_TYPE_COMPUTE_NETWORK,
                _key: networkPeering.network as string,
              },
            },
            properties: {
              ...buildPeeringNetworkRelationshipProperties(networkPeering),
            },
          }),
        );
      }
    }
  }
}

export async function fetchComputeHealthChecks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateHealthChecks(async (healthCheck) => {
    const healthCheckEntity = createHealthCheckEntity(
      healthCheck,
      client.projectId,
    );
    await jobState.addEntity(healthCheckEntity);
  });
}

export async function fetchComputeRegionHealthChecks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateRegionHealthChecks(async (healthCheck) => {
    const healthCheckEntity = createRegionHealthCheckEntity(
      healthCheck,
      client.projectId,
    );
    await jobState.addEntity(healthCheckEntity);
  });
}

export async function fetchComputeRegionInstanceGroups(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  const { projectId } = client;

  await client.iterateRegionInstanceGroups(async (regionInstanceGroup) => {
    const regionName = parseRegionNameFromRegionUrl(
      regionInstanceGroup.region!,
    );

    const regionInstanceGroupEntity = await jobState.addEntity(
      createRegionInstanceGroupEntity(
        regionInstanceGroup,
        projectId,
        regionName,
      ),
    );

    for (const namedPort of regionInstanceGroup.namedPorts || []) {
      // we could create a separate resource for this
      // e.g. region_instance_group_named_port
      // however Terraform doesn't have separate resource for this
      // so right now we're just calling it instance_group_named_port
      // and the Entity type for this is the same as the one found in
      // fetchComputeInstanceGroups
      const namedPortEntity = await jobState.addEntity(
        createInstanceGroupNamedPortEntity({
          instanceGroupId: regionInstanceGroup.id!,
          instanceGroupName: regionInstanceGroup.name!,
          namedPort,
          projectId,
          regionName,
        }),
      );

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: regionInstanceGroupEntity,
          to: namedPortEntity,
        }),
      );
    }
  });
}

export async function fetchComputeInstanceGroups(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);
  const { projectId } = client;

  await client.iterateInstanceGroups(async (instanceGroup) => {
    const regionName = parseRegionNameFromRegionUrl(instanceGroup.zone!);

    const instanceGroupEntity = await jobState.addEntity(
      createInstanceGroupEntity(instanceGroup, projectId, regionName),
    );

    for (const namedPort of instanceGroup.namedPorts || []) {
      const namedPortEntity = await jobState.addEntity(
        createInstanceGroupNamedPortEntity({
          instanceGroupId: instanceGroup.id!,
          instanceGroupName: instanceGroup.name!,
          namedPort,
          projectId,
          regionName,
        }),
      );

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: instanceGroupEntity,
          to: namedPortEntity,
        }),
      );
    }
  });
}

function getBackendServices(
  pathMatchers: compute_v1.Schema$PathMatcher[],
  type: 'backendServices' | 'backendBuckets',
) {
  const services: string[] = [];

  for (const pathMatcher of pathMatchers) {
    if (
      pathMatcher.defaultService?.includes(type) &&
      !services.find((backend) => backend == pathMatcher.defaultService)
    ) {
      services.push(pathMatcher.defaultService);
    }

    // Sub-urls can have different services assigned to them
    for (const pathRule of pathMatcher.pathRules || []) {
      if (
        pathRule.service?.includes(type) &&
        !services.find((backend) => backend == pathRule.service)
      ) {
        services.push(pathRule.service);
      }
    }
  }

  return services;
}

export async function fetchComputeRegionLoadBalancers(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateRegionLoadBalancers(async (loadBalancer) => {
    const loadBalancerEntity = createRegionLoadBalancerEntity(loadBalancer);
    await jobState.addEntity(loadBalancerEntity);

    const backendServicesIds = getBackendServices(
      loadBalancer.pathMatchers || [],
      'backendServices',
    );

    // regionLoadbalancer -> HAS -> regionBackendService relationship
    for (const backendServiceKey of backendServicesIds) {
      const backendService = await jobState.findEntity(backendServiceKey);
      if (backendService) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: loadBalancerEntity,
            to: backendService,
          }),
        );
      }
    }

    // region backend buckets don't exists
    // To be researched: can region loadbalancer have backend buckets (non-region ones)?
    // Add regionLoadbalancer -> HAS -> backendBucket relationships
  });
}

export async function fetchComputeLoadBalancers(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateLoadBalancers(async (loadBalancer) => {
    const loadBalancerEntity = createLoadBalancerEntity(loadBalancer);
    await jobState.addEntity(loadBalancerEntity);

    const backendServicesIds = getBackendServices(
      loadBalancer.pathMatchers || [],
      'backendServices',
    );
    const backendBucketsIds = getBackendServices(
      loadBalancer.pathMatchers || [],
      'backendBuckets',
    );

    // loadbalancer -> HAS -> backendService relationships
    for (const backendServiceKey of backendServicesIds) {
      const backendService = await jobState.findEntity(backendServiceKey);
      if (backendService) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: loadBalancerEntity,
            to: backendService,
          }),
        );
      }
    }

    // loadbalancer -> HAS -> backendBucket relationships
    for (const backendBucketKey of backendBucketsIds) {
      const backendBucket = await jobState.findEntity(backendBucketKey);
      if (backendBucket) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: loadBalancerEntity,
            to: backendBucket,
          }),
        );
      }
    }
  });
}

export async function fetchComputeRegionBackendServices(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateRegionBackendServices(async (regionBackendService) => {
    const regionBackendServiceEntity =
      createRegionBackendServiceEntity(regionBackendService);
    await jobState.addEntity(regionBackendServiceEntity);

    // Get all the instanceGroupKeys
    for (const backend of regionBackendService.backends || []) {
      if (backend.group?.includes('instanceGroups')) {
        const instanceGroupEntity = await jobState.findEntity(backend.group);
        if (instanceGroupEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: regionBackendServiceEntity,
              to: instanceGroupEntity,
            }),
          );
        }
      }
    }

    // Add relationships to health checks
    for (const healthCheckKey of regionBackendService.healthChecks || []) {
      const healthCheckEntity = await jobState.findEntity(healthCheckKey);
      if (healthCheckEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: regionBackendServiceEntity,
            to: healthCheckEntity,
          }),
        );
      }
    }
  });
}

export async function fetchComputeBackendServices(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateBackendServices(async (backendService) => {
    const backendServiceEntity = createBackendServiceEntity(backendService);
    await jobState.addEntity(backendServiceEntity);

    // Get all the instanceGroupKeys
    for (const backend of backendService.backends || []) {
      if (backend.group?.includes('instanceGroups')) {
        const instanceGroupEntity = await jobState.findEntity(backend.group);
        if (instanceGroupEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: backendServiceEntity,
              to: instanceGroupEntity,
            }),
          );
        }
      }
    }

    // Add relationships to health checks
    for (const healthCheckKey of backendService.healthChecks || []) {
      const healthCheckEntity = await jobState.findEntity(healthCheckKey);
      if (healthCheckEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: backendServiceEntity,
            to: healthCheckEntity,
          }),
        );
      }
    }
  });
}

export async function fetchComputeBackendBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateBackendBuckets(async (backendBucket) => {
    const backendBucketEntity = createBackendBucketEntity(backendBucket);
    await jobState.addEntity(backendBucketEntity);
  });
}

export async function buildComputeBackendBucketHasBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET },
    async (backendBucketEntity) => {
      const instance =
        getRawData<compute_v1.Schema$BackendBucket>(backendBucketEntity);
      if (!instance) {
        logger.warn(
          {
            _key: backendBucketEntity._key,
          },
          'Could not find raw data on backend bucket instance entity',
        );
        return;
      }

      const bucketName = instance.bucketName;
      if (!bucketName) {
        return;
      }

      const bucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(bucketName),
      );
      if (!bucketEntity) {
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: backendBucketEntity,
          to: bucketEntity,
        }),
      );
    },
  );
}

export async function fetchComputeTargetSslProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateTargetSslProxies(async (targetSslProxy) => {
    const targetSslProxyEntity = createTargetSslProxyEntity(targetSslProxy);
    await jobState.addEntity(targetSslProxyEntity);

    // NOTE - SSL load balancer is slightly different
    // targetSslProxy does not have urlMap field that points to its load balancer (like targetHttp and targetHttps do)
    // but instead, SSL load balancer actually exists as a backendService and cannot be found with urlMap

    const backendServiceEntity = await jobState.findEntity(
      targetSslProxy.service as string,
    );
    if (backendServiceEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: backendServiceEntity,
          to: targetSslProxyEntity,
        }),
      );
    }
  });
}

export async function fetchComputeRegionTargetHttpsProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateRegionTargetHttpsProxies(async (targetHttpsProxy) => {
    const targetHttpsProxyEntity =
      createRegionTargetHttpsProxyEntity(targetHttpsProxy);
    await jobState.addEntity(targetHttpsProxyEntity);

    const loadBalancerEntity = await jobState.findEntity(
      targetHttpsProxy.urlMap as string,
    );
    if (loadBalancerEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: loadBalancerEntity,
          to: targetHttpsProxyEntity,
        }),
      );
    }
  });
}

export async function fetchComputeTargetHttpsProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateTargetHttpsProxies(async (targetHttpsProxy) => {
    const targetHttpsProxyEntity =
      createTargetHttpsProxyEntity(targetHttpsProxy);
    await jobState.addEntity(targetHttpsProxyEntity);

    const loadBalancerEntity = await jobState.findEntity(
      targetHttpsProxy.urlMap as string,
    );
    if (loadBalancerEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: loadBalancerEntity,
          to: targetHttpsProxyEntity,
        }),
      );
    }
  });
}

export async function fetchComputeRegionTargetHttpProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateRegionTargetHttpProxies(async (targetHttpProxy) => {
    const targetHttpProxyEntity =
      createRegionTargetHttpProxyEntity(targetHttpProxy);
    await jobState.addEntity(targetHttpProxyEntity);

    const loadBalancerEntity = await jobState.findEntity(
      targetHttpProxy.urlMap as string,
    );
    if (loadBalancerEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: loadBalancerEntity,
          to: targetHttpProxyEntity,
        }),
      );
    }
  });
}

export async function fetchComputeTargetHttpProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateTargetHttpProxies(async (targetHttpProxy) => {
    const targetHttpProxyEntity = createTargetHttpProxyEntity(targetHttpProxy);
    await jobState.addEntity(targetHttpProxyEntity);

    const loadBalancerEntity = await jobState.findEntity(
      targetHttpProxy.urlMap as string,
    );
    if (loadBalancerEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: loadBalancerEntity,
          to: targetHttpProxyEntity,
        }),
      );
    }
  });
}

export async function fetchComputeSslPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = createComputeClient(context, logger);

  await client.iterateSslPolicies(async (sslPolicy) => {
    const sslPolicyEntity = createSslPolicyEntity(sslPolicy);
    await jobState.addEntity(sslPolicyEntity);

    // TARGET_HTTPS_PROXY -> HAS -> SSL_POLICY
    await jobState.iterateEntities(
      {
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
      async (targetHttpsProxyEntity) => {
        if (
          (targetHttpsProxyEntity.sslPolicy as string) === sslPolicy.selfLink
        ) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: targetHttpsProxyEntity,
              to: sslPolicyEntity,
            }),
          );
        }
      },
    );

    // TARGET_SSL_PROXY -> HAS -> SSL_POLICY
    await jobState.iterateEntities(
      {
        _type: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
      },
      async (targetSslProxyEntity) => {
        if ((targetSslProxyEntity.sslPolicy as string) === sslPolicy.selfLink) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: targetSslProxyEntity,
              to: sslPolicyEntity,
            }),
          );
        }
      },
    );
  });
}

export const computeSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_COMPUTE_NETWORKS,
    name: 'Compute Networks',
    entities: [
      {
        resourceName: 'Compute Networks',
        _type: ENTITY_TYPE_COMPUTE_NETWORK,
        _class: ENTITY_CLASS_COMPUTE_NETWORK,
      },
    ],
    relationships: [],
    executionHandler: fetchComputeNetworks,
    permissions: ['compute.networks.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
    name: 'Compute Networks Peerings',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.CONNECTS,
        _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_CONNECTS_NETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
    ],
    dependsOn: [STEP_COMPUTE_NETWORKS],
    executionHandler: buildComputeNetworkPeeringRelationships,
  },
  {
    id: STEP_COMPUTE_ADDRESSES,
    name: 'Compute Addresses',
    entities: [
      {
        resourceName: 'Compute Address',
        _type: ENTITY_TYPE_COMPUTE_ADDRESS,
        _class: ENTITY_CLASS_COMPUTE_ADDRESS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_ADDRESS,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_ADDRESS,
        sourceType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
        targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
      },
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_COMPUTE_INSTANCE_USES_ADDRESS,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
      },
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_USES_ADDRESS,
        sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_ADDRESS,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_NETWORKS,
      STEP_COMPUTE_SUBNETWORKS,
      STEP_COMPUTE_INSTANCES,
      STEP_COMPUTE_FORWARDING_RULES,
    ],
    executionHandler: fetchComputeAddresses,
    permissions: ['compute.addresses.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_GLOBAL_ADDRESSES,
    name: 'Compute Global Addresses',
    entities: [
      {
        resourceName: 'Compute Global Address',
        _type: ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
        _class: ENTITY_CLASS_COMPUTE_GLOBAL_ADDRESS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_COMPUTE_NETWORK_HAS_GLOBAL_ADDRESS,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_COMPUTE_SUBNETWORK_HAS_GLOBAL_ADDRESS,
        sourceType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
        targetType: ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
      },
    ],
    dependsOn: [STEP_COMPUTE_NETWORKS, STEP_COMPUTE_SUBNETWORKS],
    executionHandler: fetchComputeGlobalAddresses,
    permissions: ['compute.globalAddresses.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_FORWARDING_RULES,
    name: 'Compute Forwarding Rules',
    entities: [
      {
        resourceName: 'Compute Forwarding Rule',
        _type: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        _class: ENTITY_CLASS_COMPUTE_FORWARDING_RULE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
        sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type: RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_SUBNETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type: RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_NETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_REGION_BACKEND_SERVICES,
      STEP_COMPUTE_NETWORKS,
      STEP_COMPUTE_SUBNETWORKS,
      STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
      STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
    ],
    executionHandler: fetchComputeForwardingRules,
    permissions: ['compute.forwardingRules.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
    name: 'Compute Global Forwarding Rules',
    entities: [
      {
        resourceName: 'Compute Global Forwarding Rule',
        _type: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        _class: ENTITY_CLASS_COMPUTE_GLOBAL_FORWARDING_RULE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_BACKEND_SERVICE,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_SUBNETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_NETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTP_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
      },
      {
        _class: RelationshipClass.CONNECTS,
        _type:
          RELATIONSHIP_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE_CONNECTS_TARGET_HTTPS_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_BACKEND_SERVICES,
      STEP_COMPUTE_NETWORKS,
      STEP_COMPUTE_SUBNETWORKS,
      STEP_COMPUTE_TARGET_HTTP_PROXIES,
      STEP_COMPUTE_TARGET_HTTPS_PROXIES,
    ],
    executionHandler: fetchComputeGlobalForwardingRules,
    permissions: ['compute.globalForwardingRules.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_FIREWALLS,
    name: 'Compute Firewalls',
    entities: [
      {
        resourceName: 'Compute Firewalls',
        _type: ENTITY_TYPE_COMPUTE_FIREWALL,
        _class: ENTITY_CLASS_COMPUTE_FIREWALL,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.PROTECTS,
        _type: RELATIONSHIP_TYPE_FIREWALL_PROTECTS_NETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_FIREWALL,
        targetType: ENTITY_TYPE_COMPUTE_NETWORK,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_NETWORK_HAS_FIREWALL,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_FIREWALL,
      },
      {
        _type: MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
        sourceType: INTERNET._type,
        _class: RelationshipClass.ALLOWS,
        targetType: ENTITY_TYPE_COMPUTE_FIREWALL,
      },
    ],
    executionHandler: fetchComputeFirewalls,
    dependsOn: [STEP_COMPUTE_NETWORKS],
    permissions: ['compute.firewalls.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_SUBNETWORKS,
    name: 'Compute Subnetworks',
    entities: [
      {
        resourceName: 'Compute Subnetwork',
        _type: ENTITY_TYPE_COMPUTE_SUBNETWORK,
        _class: ENTITY_CLASS_COMPUTE_SUBNETWORK,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.CONTAINS,
        _type:
          RELATIONSHIP_TYPE_GOOGLE_COMPUTE_NETWORK_CONTAINS_GOOGLE_COMPUTE_SUBNETWORK,
        sourceType: ENTITY_TYPE_COMPUTE_NETWORK,
        targetType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
      },
    ],
    executionHandler: fetchComputeSubnetworks,
    dependsOn: [STEP_COMPUTE_NETWORKS],
    permissions: ['compute.subnetworks.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_DISKS,
    name: 'Compute Disks',
    entities: [
      {
        resourceName: 'Compute Disk',
        _type: ENTITY_TYPE_COMPUTE_DISK,
        _class: ENTITY_CLASS_COMPUTE_DISK,
      },
    ],
    relationships: [],
    executionHandler: fetchComputeDisks,
    dependsOn: [],
    permissions: ['compute.disks.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_DISK_IMAGE_RELATIONSHIPS,
    name: 'Compute Disk Image Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_DISK_USES_IMAGE,
        sourceType: ENTITY_TYPE_COMPUTE_DISK,
        targetType: ENTITY_TYPE_COMPUTE_IMAGE,
      },
    ],
    executionHandler: buildDiskImageRelationships,
    dependsOn: [STEP_COMPUTE_DISKS, STEP_COMPUTE_IMAGES],
    permissions: ['compute.images.get'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_DISK_KMS_RELATIONSHIPS,
    name: 'Compute Disk KMS Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY,
        sourceType: ENTITY_TYPE_COMPUTE_DISK,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    executionHandler: buildDiskUsesKmsRelationships,
    dependsOn: [
      STEP_COMPUTE_DISKS,
      STEP_COMPUTE_REGION_DISKS,
      STEP_CLOUD_KMS_KEYS,
      STEP_CLOUD_KMS_KEY_RINGS,
    ],
  },
  {
    id: STEP_COMPUTE_REGION_DISKS,
    name: 'Compute Region Disks',
    entities: [
      {
        resourceName: 'Compute Region Disk',
        _type: ENTITY_TYPE_COMPUTE_DISK,
        _class: ENTITY_CLASS_COMPUTE_DISK,
      },
    ],
    relationships: [],
    executionHandler: fetchComputeRegionDisks,
    dependsOn: [],
    permissions: ['compute.disks.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_SNAPSHOTS,
    name: 'Compute Snapshots',
    entities: [
      {
        resourceName: 'Compute Snapshot',
        _type: ENTITY_TYPE_COMPUTE_SNAPSHOT,
        _class: ENTITY_CLASS_COMPUTE_SNAPSHOT,
      },
    ],
    relationships: [],
    executionHandler: fetchComputeSnapshots,
    dependsOn: [],
    permissions: ['compute.snapshots.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
    name: 'Compute Snapshot Disk Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.CREATED,
        _type: RELATIONSHIP_TYPE_DISK_CREATED_SNAPSHOT,
        sourceType: ENTITY_TYPE_COMPUTE_DISK,
        targetType: ENTITY_TYPE_COMPUTE_SNAPSHOT,
      },
    ],
    executionHandler: buildComputeSnapshotDiskRelationships,
    dependsOn: [STEP_COMPUTE_SNAPSHOTS, STEP_COMPUTE_DISKS],
  },
  {
    id: STEP_COMPUTE_IMAGES,
    name: 'Compute Images',
    entities: [
      {
        resourceName: 'Compute Image',
        _type: ENTITY_TYPE_COMPUTE_IMAGE,
        _class: ENTITY_CLASS_COMPUTE_IMAGE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.CREATED,
        _type: RELATIONSHIP_TYPE_SNAPSHOT_CREATED_IMAGE,
        sourceType: ENTITY_TYPE_COMPUTE_SNAPSHOT,
        targetType: ENTITY_TYPE_COMPUTE_IMAGE,
      },
    ],
    dependsOn: [STEP_COMPUTE_SNAPSHOTS],
    executionHandler: fetchComputeImages,
    permissions: ['compute.images.list', 'compute.images.getIamPolicy'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_IMAGE_KMS_RELATIONSHIPS,
    name: 'Build Compute Image KMS Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY,
        sourceType: ENTITY_TYPE_COMPUTE_IMAGE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_COMPUTE_IMAGES, STEP_CLOUD_KMS_KEYS],
    executionHandler: buildImageUsesKmsRelationships,
  },
  {
    id: STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
    name: 'Compute Image Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_IMAGE_CREATED_IMAGE,
        sourceType: ENTITY_TYPE_COMPUTE_IMAGE,
        targetType: ENTITY_TYPE_COMPUTE_IMAGE,
      },
    ],
    dependsOn: [STEP_COMPUTE_IMAGES],
    executionHandler: buildImageCreatedImageRelationships,
  },
  {
    id: STEP_COMPUTE_INSTANCES,
    name: 'Compute Instances',
    entities: [
      {
        resourceName: 'Compute Instance',
        _type: ENTITY_TYPE_COMPUTE_INSTANCE,
        _class: ENTITY_CLASS_COMPUTE_INSTANCE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_USES_DISK,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: ENTITY_TYPE_COMPUTE_DISK,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_SUBNET_HAS_COMPUTE_INSTANCE,
        sourceType: ENTITY_TYPE_COMPUTE_SUBNETWORK,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_COMPUTE_INSTANCE,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_DISKS,
      STEP_COMPUTE_NETWORKS,
      STEP_COMPUTE_SUBNETWORKS,
      STEP_COMPUTE_INSTANCE_GROUPS,
    ],
    executionHandler: fetchComputeInstances,
    permissions: ['compute.instances.list', 'osconfig.inventories.get'],
    apis: ['compute.googleapis.com', 'osconfig.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
    name: 'Compute Instance Service Account Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.TRUSTS,
        _type:
          RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_COMPUTE_INSTANCES, STEP_IAM_SERVICE_ACCOUNTS],
    executionHandler: buildComputeInstanceServiceAccountRelationships,
  },
  {
    id: STEP_COMPUTE_PROJECT,
    name: 'Compute Project',
    entities: [
      {
        resourceName: 'Compute Project',
        _type: ENTITY_TYPE_COMPUTE_PROJECT,
        _class: ENTITY_CLASS_COMPUTE_PROJECT,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_PROJECT_HAS_INSTANCE,
        sourceType: ENTITY_TYPE_COMPUTE_PROJECT,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE,
      },
    ],
    dependsOn: [STEP_COMPUTE_INSTANCES],
    executionHandler: fetchComputeProject,
    permissions: ['compute.projects.get'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_HEALTH_CHECKS,
    name: 'Compute Health Checks',
    entities: [
      {
        resourceName: 'Compute Health Check',
        _type: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
        _class: ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchComputeHealthChecks,
    permissions: ['compute.healthChecks.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_REGION_HEALTH_CHECKS,
    name: 'Compute Region Health Checks',
    entities: [
      {
        resourceName: 'Compute Region Health Check',
        _type: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
        _class: ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchComputeRegionHealthChecks,
    permissions: ['compute.regionHealthChecks.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_REGION_INSTANCE_GROUPS,
    name: 'Compute Region Instance Groups',
    entities: [
      {
        resourceName: 'Compute Region Instance Group',
        _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
        _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
      },
      {
        resourceName: 'Compute Instance Group Named Port',
        _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
        _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
      },
    ],
    dependsOn: [],
    executionHandler: fetchComputeRegionInstanceGroups,
    permissions: ['compute.instanceGroups.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_INSTANCE_GROUPS,
    name: 'Compute Instance Groups',
    entities: [
      {
        resourceName: 'Compute Instance Group',
        _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
        _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
      },
      {
        resourceName: 'Compute Instance Group Named Port',
        _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
        _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_INSTANCE_GROUP_HAS_NAMED_PORT,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
      },
    ],
    dependsOn: [],
    executionHandler: fetchComputeInstanceGroups,
    permissions: ['compute.instanceGroups.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_LOADBALANCERS,
    name: 'Compute Load Balancers',
    entities: [
      {
        resourceName: 'Compute Load Balancer',
        _type: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        _class: ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_BUCKET,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
      },
    ],
    dependsOn: [STEP_COMPUTE_BACKEND_SERVICES, STEP_COMPUTE_BACKEND_BUCKETS],
    executionHandler: fetchComputeLoadBalancers,
    permissions: ['compute.urlMaps.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_REGION_LOADBALANCERS,
    name: 'Compute Region Load Balancers',
    entities: [
      {
        resourceName: 'Compute Region Load Balancer',
        _type: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        _class: ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_BACKEND_SERVICE,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      },
    ],
    dependsOn: [STEP_COMPUTE_REGION_BACKEND_SERVICES],
    executionHandler: fetchComputeRegionLoadBalancers,
    permissions: ['compute.regionUrlMaps.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_BACKEND_SERVICES,
    name: 'Compute Backend Services',
    entities: [
      {
        resourceName: 'Compute Backend Service',
        _type: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        _class: ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        targetType: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
      },
    ],
    dependsOn: [STEP_COMPUTE_INSTANCE_GROUPS, STEP_COMPUTE_HEALTH_CHECKS],
    executionHandler: fetchComputeBackendServices,
    permissions: ['compute.backendServices.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_REGION_BACKEND_SERVICES,
    name: 'Compute Region Backend Services',
    entities: [
      {
        resourceName: 'Compute Backend Service',
        _type: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        _class: ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_INSTANCE_GROUP,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        targetType: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_HEALTH_CHECK,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        targetType: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_REGION_INSTANCE_GROUPS,
      STEP_COMPUTE_REGION_HEALTH_CHECKS,
    ],
    executionHandler: fetchComputeRegionBackendServices,
    permissions: ['compute.regionBackendServices.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_BACKEND_BUCKETS,
    name: 'Compute Backend Buckets',
    entities: [
      {
        resourceName: 'Compute Backend Bucket',
        _type: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
        _class: ENTITY_CLASS_COMPUTE_BACKEND_BUCKET,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchComputeBackendBuckets,
    permissions: ['compute.backendBuckets.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_CREATE_COMPUTE_BACKEND_BUCKET_BUCKET_RELATIONSHIPS,
    name: 'Build Compute Backend Bucket Bucket Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
        targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_BACKEND_BUCKETS,
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    ],
    executionHandler: buildComputeBackendBucketHasBucketRelationships,
  },
  {
    id: STEP_COMPUTE_TARGET_SSL_PROXIES,
    name: 'Compute Target SSL Proxies',
    entities: [
      {
        resourceName: 'Compute Target SSL Proxy',
        _type: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
        _class: ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_SERVICE_HAS_TARGET_SSL_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
      },
    ],
    dependsOn: [STEP_COMPUTE_BACKEND_SERVICES],
    executionHandler: fetchComputeTargetSslProxies,
    permissions: ['compute.targetSslProxies.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_TARGET_HTTPS_PROXIES,
    name: 'Compute Target HTTPS Proxies',
    entities: [
      {
        resourceName: 'Compute Target HTTPS Proxy',
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    dependsOn: [STEP_COMPUTE_LOADBALANCERS],
    executionHandler: fetchComputeTargetHttpsProxies,
    permissions: ['compute.targetHttpsProxies.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
    name: 'Compute Region Target HTTPS Proxies',
    entities: [
      {
        resourceName: 'Compute Region Target HTTPS Proxy',
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTPS_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
      },
    ],
    dependsOn: [STEP_COMPUTE_REGION_LOADBALANCERS],
    executionHandler: fetchComputeRegionTargetHttpsProxies,
    permissions: ['compute.regionTargetHttpsProxies.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_TARGET_HTTP_PROXIES,
    name: 'Compute Target HTTP Proxies',
    entities: [
      {
        resourceName: 'Compute Target HTTP Proxy',
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
      },
    ],
    dependsOn: [STEP_COMPUTE_LOADBALANCERS],
    executionHandler: fetchComputeTargetHttpProxies,
    permissions: ['compute.targetHttpProxies.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
    name: 'Compute Region Target HTTP Proxies',
    entities: [
      {
        resourceName: 'Compute Region Target HTTP Proxy',
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_LOAD_BALANCER_HAS_TARGET_HTTP_PROXY,
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
      },
    ],
    dependsOn: [STEP_COMPUTE_REGION_LOADBALANCERS],
    executionHandler: fetchComputeRegionTargetHttpProxies,
    permissions: ['compute.regionTargetHttpProxies.list'],
    apis: ['compute.googleapis.com'],
  },
  {
    id: STEP_COMPUTE_SSL_POLICIES,
    name: 'Compute SSL Policies',
    entities: [
      {
        resourceName: 'Compute SSL Policy',
        _type: ENTITY_TYPE_COMPUTE_SSL_POLICY,
        _class: ENTITY_CLASS_COMPUTE_SSL_POLICY,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_TARGET_HTTPS_PROXY_HAS_SSL_POLICY,
        sourceType: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
        targetType: ENTITY_TYPE_COMPUTE_SSL_POLICY,
      },
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_TARGET_SSL_PROXY_HAS_SSL_POLICY,
        sourceType: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
        targetType: ENTITY_TYPE_COMPUTE_SSL_POLICY,
      },
    ],
    dependsOn: [
      STEP_COMPUTE_TARGET_HTTPS_PROXIES,
      STEP_COMPUTE_TARGET_SSL_PROXIES,
    ],
    executionHandler: fetchComputeSslPolicies,
    permissions: ['compute.sslPolicies.list'],
    apis: ['compute.googleapis.com'],
  },
];
