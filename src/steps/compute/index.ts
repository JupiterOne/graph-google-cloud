import {
  IntegrationStep,
  JobState,
  Entity,
  createDirectRelationship,
  createMappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { ComputeClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  createComputeDiskEntity,
  createComputeInstanceEntity,
  createComputeInstanceUsesComputeDiskRelationship,
  createComputeInstanceTrustsServiceAccountRelationship,
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
} from './constants';
import { compute_v1 } from 'googleapis';
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
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
} from '../storage';
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

export * from './constants';

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

async function iterateComputeInstanceServiceAccounts(params: {
  context: IntegrationStepContext;
  computeInstanceEntity: Entity;
  computeInstance: compute_v1.Schema$Instance;
}) {
  const {
    context: { jobState, logger },
    computeInstanceEntity,
    computeInstance,
  } = params;

  for (const serviceAccount of computeInstance.serviceAccounts || []) {
    const serviceAccountEntity = await jobState.findEntity(
      serviceAccount.email as string,
    );

    if (!serviceAccountEntity) {
      // This should never happen because this step dependsOn the fetch service
      // account step.
      logger.warn(
        'Skipping building relationship between compute instance and service account. Service account entity does not exist.',
      );
      continue;
    }

    await jobState.addRelationship(
      createComputeInstanceTrustsServiceAccountRelationship({
        computeInstanceEntity,
        serviceAccountEntity,
        scopes: serviceAccount.scopes || [],
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
  const { jobState, instance, logger } = context;
  const client = new ComputeClient({ config: instance.config });

  let computeProject: compute_v1.Schema$Project;

  try {
    computeProject = await client.fetchComputeProject();
  } catch (err) {
    if (err.code === 403) {
      logger.trace(
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

async function buildComputeDiskUsesKmsKeyRelationship({
  jobState,
  diskEntity,
  disk,
}: {
  jobState: JobState;
  diskEntity: Entity;
  disk: compute_v1.Schema$Disk;
}) {
  const kmsKeyName = disk.diskEncryptionKey?.kmsKeyName;

  if (!kmsKeyName) {
    return;
  }

  const kmsKeyEntity = await jobState.findEntity(
    getKmsGraphObjectKeyFromKmsKeyName(kmsKeyName),
  );

  if (kmsKeyEntity) {
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.USES,
        from: diskEntity,
        to: kmsKeyEntity,
      }),
    );
  }
}

export async function fetchComputeDisks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance, logger } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateComputeDisks(async (disk) => {
    await jobState.setData(`disk:${disk.selfLink}`, `disk:${disk.id}`);

    const diskEntity = await jobState.addEntity(
      createComputeDiskEntity(disk, client.projectId),
    );

    if (disk.sourceImage) {
      // disk.sourceImage looks like this:
      // https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev-v2/global/images/my-custom-image
      // https://www.googleapis.com/compute/v1/projects/ubuntu-os-cloud/global/images/ubuntu-1804-bionic-v20210211
      // ProjectId part can be good separator between public and custom images and is necessary for images.get API call
      const sourceImageProjectId = disk.sourceImage?.split('/')[6];
      const sourceImageName = disk.sourceImage?.split('/')[9];

      if (sourceImageProjectId === client.projectId) {
        // Custom image case
        const imageEntity = await jobState.findEntity(
          `image:${disk.sourceImageId}`,
        );
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
            logger.trace(
              { err },
              'Could not fetch compute image. Requires additional permission',
            );

            publishMissingPermissionEvent({
              logger,
              permission: 'compute.images.get',
              stepId: STEP_COMPUTE_DISKS,
            });

            return;
          }

          throw err;
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

    await buildComputeDiskUsesKmsKeyRelationship({
      jobState,
      disk,
      diskEntity,
    });
  });
}

export async function fetchComputeSnapshots(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

export async function fetchComputeImages(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateCustomComputeImages(async (image) => {
    const imagePolicy = await client.fetchComputeImagePolicy(
      image.name as string,
    );
    const imageEntity = createComputeImageEntity({
      data: image,
      isPublic: isComputeImagePublicAccess(imagePolicy),
    });
    await jobState.addEntity(imageEntity);

    if (image.imageEncryptionKey?.kmsKeyName) {
      const kmsNameWithoutVersion = getKmsGraphObjectKeyFromKmsKeyName(
        image.imageEncryptionKey.kmsKeyName,
      );

      const cryptoKeyEntity = await jobState.findEntity(kmsNameWithoutVersion);

      if (cryptoKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: imageEntity,
            to: cryptoKeyEntity,
          }),
        );
      }
    }

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

      const sourceImageEntity = await jobState.findEntity(
        `image:${sourceImageId}`,
      );

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
              sourceEntityKey: sourceImageId,
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
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateComputeInstances(async (computeInstance, projectId) => {
    const computeInstanceEntity = await jobState.addEntity(
      createComputeInstanceEntity(computeInstance, client.projectId),
    );

    await iterateComputeInstanceServiceAccounts({
      context,
      computeInstance,
      computeInstanceEntity,
    });

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

  for (const rule of firewall.allowed || []) {
    await processFirewallRuleRelationshipTargets({
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

  for (const rule of firewall.denied || []) {
    await processFirewallRuleRelationshipTargets({
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
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

export async function fetchComputeNetworks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateNetworks(async (network) => {
    await jobState.addEntity(
      createComputeNetworkEntity(network, client.projectId),
    );
  });
}

export async function fetchHealthChecks(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateHealthChecks(async (healthCheck) => {
    const healthCheckEntity = createHealthCheckEntity(healthCheck);
    await jobState.addEntity(healthCheckEntity);
  });
}

export async function fetchComputeInstanceGroups(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });
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

export async function fetchLoadBalancers(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

    // Add loadbalancer -> HAS -> backendService relationships
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

    // Add loadbalancer -> HAS -> backendBucket relationships
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

export async function fetchBackendServices(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

export async function fetchBackendBuckets(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

  await client.iterateBackendBuckets(async (backendBucket) => {
    const backendBucketEntity = createBackendBucketEntity(backendBucket);
    await jobState.addEntity(backendBucketEntity);

    const storageBucketEntity = await jobState.findEntity(
      getCloudStorageBucketKey(backendBucket.bucketName as string),
    );
    if (storageBucketEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: backendBucketEntity,
          to: storageBucketEntity,
        }),
      );
    }
  });
}

export async function fetchTargetSslProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

export async function fetchTargetHttpsProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

export async function fetchTargetHttpProxies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

export async function fetchSslPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new ComputeClient({ config: instance.config });

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

export const computeSteps: IntegrationStep<IntegrationConfig>[] = [
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
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_DISK_USES_IMAGE,
        sourceType: ENTITY_TYPE_COMPUTE_DISK,
        targetType: ENTITY_TYPE_COMPUTE_IMAGE,
      },
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_COMPUTE_DISK_USES_KMS_CRYPTO_KEY,
        sourceType: ENTITY_TYPE_COMPUTE_DISK,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    executionHandler: fetchComputeDisks,
    dependsOn: [
      STEP_CLOUD_KMS_KEYS,
      STEP_CLOUD_KMS_KEY_RINGS,
      STEP_COMPUTE_IMAGES,
    ],
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
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_IMAGE_USES_KMS_KEY,
        sourceType: ENTITY_TYPE_COMPUTE_IMAGE,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
      {
        _class: RelationshipClass.CREATED,
        _type: RELATIONSHIP_TYPE_SNAPSHOT_CREATED_IMAGE,
        sourceType: ENTITY_TYPE_COMPUTE_SNAPSHOT,
        targetType: ENTITY_TYPE_COMPUTE_IMAGE,
      },
    ],
    dependsOn: [STEP_CLOUD_KMS_KEYS],
    executionHandler: fetchComputeImages,
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
        _class: RelationshipClass.TRUSTS,
        _type:
          RELATIONSHIP_TYPE_GOOGLE_COMPUTE_INSTANCE_TRUSTS_IAM_SERVICE_ACCOUNT,
        sourceType: ENTITY_TYPE_COMPUTE_INSTANCE,
        targetType: IAM_SERVICE_ACCOUNT_ENTITY_TYPE,
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
      STEP_IAM_SERVICE_ACCOUNTS,
      STEP_COMPUTE_NETWORKS,
      STEP_COMPUTE_SUBNETWORKS,
      STEP_COMPUTE_INSTANCE_GROUPS,
    ],
    executionHandler: fetchComputeInstances,
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
    executionHandler: fetchHealthChecks,
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
        sourceType: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        targetType: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
      },
    ],
    dependsOn: [],
    executionHandler: fetchComputeInstanceGroups,
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
    executionHandler: fetchLoadBalancers,
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
    executionHandler: fetchBackendServices,
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
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_BACKEND_BUCKET_HAS_STORAGE_BUCKET,
        sourceType: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
        targetType: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_CLOUD_STORAGE_BUCKETS],
    executionHandler: fetchBackendBuckets,
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
    executionHandler: fetchTargetSslProxies,
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
    executionHandler: fetchTargetHttpsProxies,
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
    executionHandler: fetchTargetHttpProxies,
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
    executionHandler: fetchSslPolicies,
  },
];
