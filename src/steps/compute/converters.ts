import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  getTime,
  parseTimePropertyValue,
  PrimitiveEntity,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
  TargetFilterKey,
} from '@jupiterone/integration-sdk-core';
import { compute_v1, osconfig_v1 } from 'googleapis';
import { parseRegionNameFromRegionUrl } from '../../google-cloud/regions';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { FirewallRuleRelationshipTargetProperties } from '../../utils/firewall';
import { getGoogleCloudConsoleWebLink, getLastUrlPart } from '../../utils/url';
import {
  ENTITY_CLASS_COMPUTE_ADDRESS,
  ENTITY_CLASS_COMPUTE_BACKEND_BUCKET,
  ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
  ENTITY_CLASS_COMPUTE_DISK,
  ENTITY_CLASS_COMPUTE_FIREWALL,
  ENTITY_CLASS_COMPUTE_FORWARDING_RULE,
  ENTITY_CLASS_COMPUTE_GLOBAL_ADDRESS,
  ENTITY_CLASS_COMPUTE_GLOBAL_FORWARDING_RULE,
  ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
  ENTITY_CLASS_COMPUTE_IMAGE,
  ENTITY_CLASS_COMPUTE_INSTANCE,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
  ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
  ENTITY_CLASS_COMPUTE_NETWORK,
  ENTITY_CLASS_COMPUTE_PROJECT,
  ENTITY_CLASS_COMPUTE_SNAPSHOT,
  ENTITY_CLASS_COMPUTE_SSL_POLICY,
  ENTITY_CLASS_COMPUTE_SUBNETWORK,
  ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY,
  ENTITY_TYPE_COMPUTE_ADDRESS,
  ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
  ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
  ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
  ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
  ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
  ENTITY_TYPE_COMPUTE_IMAGE,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
  ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
  ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_PROJECT,
  ENTITY_TYPE_COMPUTE_SNAPSHOT,
  ENTITY_TYPE_COMPUTE_SSL_POLICY,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
  ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
} from './constants';

export function createComputeProjectEntity(data: compute_v1.Schema$Project) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_PROJECT,
        _type: ENTITY_TYPE_COMPUTE_PROJECT,
        _key: data.selfLink as string,
        id: data.id as string,
        displayName: data.name as string,
        // 4.4 Ensure oslogin is enabled for a Project (Scored) - Project part
        isOSLoginEnabled:
          data.commonInstanceMetadata?.items
            ?.find((item) => item.key === 'enable-oslogin')
            ?.value?.toUpperCase() === 'TRUE',
        name: data.name,
        kind: data.kind,
        defaultServiceAccount: data.defaultServiceAccount,
        defaultNetworkTier: data.defaultNetworkTier,
        createdOn: parseTimePropertyValue(data.creationTimestamp),
      },
    },
  });
}

export function createComputeImageEntity({
  data,
  isPublic,
}: {
  data: compute_v1.Schema$Image;
  isPublic: boolean;
}) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_IMAGE,
        _type: ENTITY_TYPE_COMPUTE_IMAGE,
        _key: (data.selfLink || data.id) as string,
        id: data.id as string,
        name: data.name,
        displayName: data.name as string,
        deprecationState: data.deprecated?.state,
        deprecated:
          (data.deprecated?.state && data.deprecated?.state !== 'ACTIVE') ||
          false,
        kind: data.kind,
        description: data.description,
        status: data.status,
        family: data.family,
        archivedSizeBytes: data.archiveSizeBytes,
        diskSizeGb: data.diskSizeGb,
        guestOsFeatures:
          data.guestOsFeatures &&
          (data.guestOsFeatures.map((g) => g.type) as string[]),
        licenses: data.licenses,
        labelFingerprint: data.labelFingerprint,
        licenseCodes: data.licenseCodes,
        'rawDisk.containerType': data.rawDisk?.containerType,
        'rawDisk.sha1Checksum': data.rawDisk?.sha1Checksum,
        'rawDisk.source': data.rawDisk?.source,
        sourceDisk: data.sourceDisk,
        sourceDiskId: data.sourceDiskId,
        sourceImage: data.sourceImage,
        sourceImageId: data.sourceImageId,
        sourceSnapshot: data.sourceSnapshot,
        sourceSnapshotId: data.sourceSnapshotId,
        sourceType: data.sourceType,
        storageLocations: data.storageLocations,
        public: isPublic,
        createdOn: parseTimePropertyValue(data.creationTimestamp),
      },
    },
  });
}

function getCommonDiskProps(data: compute_v1.Schema$Disk) {
  return {
    id: data.id as string,
    displayName: data.name as string,
    description: data.description,
    name: data.name,
    createdOn: parseTimePropertyValue(data.creationTimestamp),
    sizeGB: data.sizeGb,
    // Reference: https://cloud.google.com/compute/docs/reference/rest/v1/disks/get#response-body
    //
    // [Output Only] The status of disk creation. CREATING: Disk is
    // provisioning.
    //
    // RESTORING: Source data is being copied into the disk.
    // FAILED: Disk creation failed.
    // READY: Disk is ready for use.
    // DELETING: Disk is deleting.
    active: data.status === 'READY',
    status: data.status,
    type: data.type && getLastUrlPart(data.type),
    licenses: data.licenses,
    guestOsFeatures:
      data.guestOsFeatures &&
      (data.guestOsFeatures.map((g) => g.type) as string[]),
    lastAttachTimestamp: parseTimePropertyValue(data.lastAttachTimestamp),
    labelFingerprint: data.labelFingerprint,
    licenseCodes: data.licenseCodes,
    physicalBlockSizeBytes: data.physicalBlockSizeBytes,
    sourceSnapshot: data.sourceSnapshot,
    sourceSnapshotId: data.sourceSnapshotId,
    // 4.7 Ensure VM disks for critical VMs are encrypted with Customer-Supplied Encryption Keys (CSEK)
    isCustomerSuppliedKeysEncrypted:
      data.diskEncryptionKey?.sha256 !== undefined,
    kmsKeyName: data.diskEncryptionKey?.kmsKeyName,
    kmsKeyServiceAccount: data.diskEncryptionKey?.kmsKeyServiceAccount,
    kind: data.kind,
    // Compute disks are encrypted by default
    encrypted: true,
    // If `classification` is not included in tags, we do not know how to
    // classify it.
    classification: null,
  };
}

export function getComputeDiskKey(id: string) {
  return `disk:${id}`;
}

export function createComputeDiskEntity(
  data: compute_v1.Schema$Disk,
  projectId: string,
) {
  const zone = getLastUrlPart(data.zone!);

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: {
        ...data,
        tags: buildComputeInstanceTags(data),
      },
      assign: {
        _class: ENTITY_CLASS_COMPUTE_DISK,
        _type: ENTITY_TYPE_COMPUTE_DISK,
        _key: getComputeDiskKey(data.id!),
        zone,
        sourceImage: data.sourceImage,
        sourceImageId: data.sourceImageId,
        regional: false,
        ...getCommonDiskProps(data),
        webLink: getGoogleCloudConsoleWebLink(
          `/compute/disksDetail/zones/${zone}/disks/${data.name}?project=${projectId}`,
        ),
      },
    },
  });
}

export function createComputeRegionDiskEntity(
  data: compute_v1.Schema$Disk,
  projectId: string,
) {
  const region = getLastUrlPart(data.region!);

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: {
        ...data,
        tags: buildComputeInstanceTags(data),
      },
      assign: {
        _class: ENTITY_CLASS_COMPUTE_DISK,
        _type: ENTITY_TYPE_COMPUTE_DISK,
        _key: `region_disk:${data.id}`,
        region,
        regional: true,
        ...getCommonDiskProps(data),
        webLink: getGoogleCloudConsoleWebLink(
          `/compute/disksDetail/regions/${region}/disks/${data.name}?project=${projectId}`,
        ),
      },
    },
  });
}

export function getComputeSnapshotKey(id: string) {
  return `snapshot:${id}`;
}

export function createComputeSnapshotEntity(data: compute_v1.Schema$Snapshot) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_SNAPSHOT,
        _type: ENTITY_TYPE_COMPUTE_SNAPSHOT,
        _key: getComputeSnapshotKey(data.id!),
        id: data.id as string,
        displayName: data.name as string,
        description: data.description,
        name: data.name,
        createdOn: parseTimePropertyValue(data.creationTimestamp),
        status: data.status,
        sourceDisk: data.sourceDisk,
        sourceDiskId: data.sourceDiskId,
        diskSizeGb: data.diskSizeGb,
        storageBytes: data.storageBytes,
        storageBytesStatus: data.storageBytesStatus,
        licenses: data.licenses,
        'snapshotEncryptionKey.kmsKeyName':
          data.snapshotEncryptionKey?.kmsKeyName,
        'snapshotEncryptionKey.kmsKeyServiceAccount':
          data.snapshotEncryptionKey?.kmsKeyServiceAccount,
        'sourceDiskEncryptionKey.kmsKeyName':
          data.sourceDiskEncryptionKey?.kmsKeyName,
        'sourceDiskEncryptionKey.kmsKeyServiceAccount':
          data.sourceDiskEncryptionKey?.kmsKeyServiceAccount,
        labelFingerprint: data.labelFingerprint,
        licenseCodes: data.licenseCodes,
        storageLocations: data.storageLocations,
        autoCreated: data.autoCreated,
        chainName: data.chainName,
        satisfiesPzs: data.satisfiesPzs,
        locationHint: data.locationHint,
        // webLink: getGoogleCloudConsoleWebLink(
        //   `/compute/disksDetail/zones/${zone}/disks/${data.name}?project=${projectId}`,
        // ),
      },
    },
  });
}

/**
 * Tags in a compute instance are simply strings with no values.
 *
 * Ex.
 *
 * "tags": {
 *   "items": [
 *      "testvmtag1",
 *      "testvmtag2"
 *    ],
 *   "fingerprint": "abc123"
 * }
 */
function buildComputeInstanceTags(data: compute_v1.Schema$Instance) {
  return data.tags && data.tags?.items?.map((item) => ({ [item]: true }));
}

export function getIpAddressesForComputeInstance(
  data: compute_v1.Schema$Instance,
) {
  const publicIpAddresses: string[] = [];
  const privateIpAddresses: string[] = [];

  for (const networkInterface of data.networkInterfaces || []) {
    if (networkInterface.networkIP) {
      privateIpAddresses.push(networkInterface.networkIP);
    }

    for (const accessConfig of networkInterface.accessConfigs || []) {
      if (accessConfig.natIP) {
        publicIpAddresses.push(accessConfig.natIP);
      }
    }
  }

  return {
    publicIpAddresses,
    privateIpAddresses,
  };
}

// 4.1 Ensure that instances are not configured to use the default service account
// 4.2 Ensure that instances are not configured to use the default service account with full access to all Cloud APIs
function getDefaultServiceAccountUsage(
  name: string,
  serviceAccounts?: compute_v1.Schema$ServiceAccount[],
) {
  /*
    Exception:
    VMs created by GKE should be excluded. These VMs have names that start with gke- and are labeled goog-gke-node
  */
  if (name.startsWith('gke-') || !serviceAccounts) {
    return {
      usesDefaultServiceAccount: undefined,
      usesFullAccessDefaultServiceAccount: undefined,
    };
  }

  /*
    Another option is to get jobState.getData(PROJECT_ENTITY_TYPE) in ./index.ts and send exact projectNumber to
    createComputeInstanceEntity() along with data: compute_v1.Schema$Instance
  */
  for (const serviceAccount of serviceAccounts) {
    if (
      serviceAccount.email &&
      /^([0-9]{12}-compute@developer.gserviceaccount.com)$/.test(
        serviceAccount.email,
      )
    ) {
      if (
        serviceAccount.scopes?.find(
          (scope) => scope === 'https://www.googleapis.com/auth/cloud-platform',
        )
      ) {
        return {
          usesDefaultServiceAccount: true,
          usesFullAccessDefaultServiceAccount: true,
        };
      }

      return {
        usesDefaultServiceAccount: true,
        usesFullAccessDefaultServiceAccount: false,
      };
    }
  }

  return {
    usesDefaultServiceAccount: false,
    usesFullAccessDefaultServiceAccount: false,
  };
}

// 4.3 Ensure "Block Project-wide SSH keys" is enabled for VM instances (Scored)
export function getBlockProjectSSHKeysValue(
  metadata?: compute_v1.Schema$Metadata,
): boolean | undefined {
  if (!metadata) return false;

  const value = metadata.items?.find(
    (item) => item.key === 'block-project-ssh-keys',
  )?.value;

  // Handle both `TRUE` and `true`
  return value ? value.toLowerCase() === 'true' : false;
}

// 4.5 Ensure 'Enable connecting to serial ports' is not enabled for VM Instance
function isSerialPortEnabled(
  metadata?: compute_v1.Schema$Metadata,
): boolean | undefined {
  if (!metadata) {
    return undefined;
  }
  /*
    We usually don't want to map original values, however this one returns true/false or 0/1 as a string
    It might be confusing if JupiterOne contained fields where true/false and 0/1 can be found in both string and boolean forms?
   */
  const value = metadata.items?.find(
    (item) => item.key === 'serial-port-enable',
  )?.value;

  return value ? value === 'true' || value === '1' : undefined;
}

/* 4.8 Ensure Compute instances are launched with Shielded VM enabled (Scored)
  Alternative to doing this is to simply expose:
  "shieldedInstanceConfig": {
    "enableVtpm": true,
    "enableIntegrityMonitoring": true,
    "enableSecureBoot": true
  },
  As entity's properties.

  All depends on what someone querying J1QL would prefer!
*/
function isShieldedVM(
  shieldedInstanceConfig?: compute_v1.Schema$ShieldedInstanceConfig,
) {
  if (!shieldedInstanceConfig) {
    return undefined;
  }

  return shieldedInstanceConfig.enableVtpm &&
    shieldedInstanceConfig.enableIntegrityMonitoring &&
    shieldedInstanceConfig.enableSecureBoot
    ? true
    : false;
}

export function createComputeInstanceEntity(
  data: compute_v1.Schema$Instance,
  instanceInventory: osconfig_v1.Schema$Inventory | undefined,
  projectId: string,
) {
  const ipAddresses = getIpAddressesForComputeInstance(data);
  const zone = getLastUrlPart(data.zone!);

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: {
        tags: buildComputeInstanceTags(data),
      },
      assign: {
        _class: ENTITY_CLASS_COMPUTE_INSTANCE,
        _type: ENTITY_TYPE_COMPUTE_INSTANCE,
        _key: data.selfLink as string,
        id: data.id as string,
        displayName: data.name as string,
        enableConfidentialCompute:
          data.confidentialInstanceConfig?.enableConfidentialCompute,
        name: data.name,
        createdOn: getTime(data.creationTimestamp),
        machineType: data.machineType && getLastUrlPart(data.machineType),
        // Reference: https://cloud.google.com/compute/docs/reference/rest/v1/instances/get#response-body
        //
        // [Output Only] The status of the instance. One of the following values:
        // PROVISIONING, STAGING, RUNNING, STOPPING, SUSPENDING, SUSPENDED,
        // REPAIRING, and TERMINATED.
        active: data.status === 'RUNNING',
        status: data.status,
        // 4.4 Ensure oslogin is enabled for a Project (Scored) - Instance part
        isOSLoginEnabled:
          data.metadata?.items
            ?.find((item) => item.key === 'enable-oslogin')
            ?.value?.toUpperCase() === 'TRUE',
        zone,
        canIpForward: data.canIpForward,
        cpuPlatform: data.cpuPlatform,
        ...getDefaultServiceAccountUsage(
          data.name as string,
          data.serviceAccounts,
        ),
        blockProjectSSHKeys: getBlockProjectSSHKeysValue(data.metadata),
        connectedNetworksCount: data.networkInterfaces?.length,
        isSerialPortEnabled: isSerialPortEnabled(data.metadata),

        // Properties to determine whether a VM is shielded or not
        isShieldedVM: isShieldedVM(data.shieldedInstanceConfig),
        integrityMonitoringEnabled:
          data.shieldedInstanceConfig?.enableIntegrityMonitoring === true,
        secureBootEnabled:
          data.shieldedInstanceConfig?.enableSecureBoot === true,
        vtpmEnabled: data.shieldedInstanceConfig?.enableVtpm === true,

        labelFingerprint: data.labelFingerprint,
        startRestricted: data.startRestricted,
        deletionProtection: data.deletionProtection,
        fingerprint: data.fingerprint,
        kind: data.kind,
        publicIpAddress: ipAddresses.publicIpAddresses,
        privateIpAddress: ipAddresses.privateIpAddresses,
        hostname: data.hostname || null,
        serviceAccountEmails: data.serviceAccounts?.map((s) => s.email!),
        webLink: getGoogleCloudConsoleWebLink(
          `/compute/instancesDetail/zones/${zone}/instances/${data.name}?project=${projectId}`,
        ),
        osHostname: instanceInventory?.osInfo?.hostname,
        osLongName: instanceInventory?.osInfo?.longName,
        osShortName: instanceInventory?.osInfo?.shortName,
        osKernelVersion: instanceInventory?.osInfo?.kernelVersion,
        osArchitecture: instanceInventory?.osInfo?.architecture,
        osVersion: instanceInventory?.osInfo?.version,
        osconfigAgentVersion: instanceInventory?.osInfo?.osconfigAgentVersion,
        updateTime: parseTimePropertyValue(instanceInventory?.updateTime),
      },
    },
  });
}

export function createComputeInstanceUsesComputeDiskRelationship(params: {
  computeInstanceEntity: Entity;
  computeDiskEntity: Entity;
  /**
   * The mode in which to attach this disk, either READ_WRITE or READ_ONLY.
   * If not specified, the default is to attach the disk in READ_WRITE mode.
   */
  mode?: string | null;
  /**
   * Specifies whether the disk will be auto-deleted when the instance is
   * deleted (but not when the disk is detached from the instance).
   */
  autoDelete?: boolean | null;
  /**
   * Specifies a unique device name of your choice that is reflected into the
   * /dev/disk/by-id/google-* tree of a Linux operating system running within
   * the instance. This name can be used to reference the device for mounting,
   * resizing, and so on, from within the instance. If not specified, the server
   * chooses a default device name to apply to this disk, in the form
   * persistent-disk-x, where x is a number assigned by Google Compute Engine.
   * This field is only applicable for persistent disks.
   */
  deviceName?: string | null;
  /**
   * Specifies the disk interface to use for attaching this disk, which is either
   * SCSI or NVME. The default is SCSI. Persistent disks must always use SCSI
   * and the request will fail if you attempt to attach a persistent disk in
   * any other format than SCSI. Local SSDs can use either NVME or SCSI. For
   * performance characteristics of SCSI over NVMe, see Local SSD performance.
   */
  interface?: string | null;
}) {
  return createDirectRelationship({
    _class: RelationshipClass.USES,
    from: params.computeInstanceEntity,
    to: params.computeDiskEntity,
    properties: {
      mode: params.mode,
      autoDelete: params.autoDelete,
      deviceName: params.deviceName,
      interface: params.interface,
    },
  });
}

/**
 * Google Cloud Docs ref:
 *
 * Only one service account per VM instance is supported. Service accounts
 * generate access tokens that can be accessed through the metadata server and
 * used to authenticate applications on the instance.
 */
export function createComputeInstanceTrustsServiceAccountRelationship(params: {
  computeInstanceEntity: Entity;
  serviceAccountEntity: Entity;
  scopes: string[];
}): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.TRUSTS,
    from: params.computeInstanceEntity,
    to: params.serviceAccountEntity,
    properties: {
      scopes: `[${params.scopes.join(',')}]`,
    },
  });
}

export function createComputeFirewallEntity(data: compute_v1.Schema$Firewall) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_FIREWALL,
        _type: ENTITY_TYPE_COMPUTE_FIREWALL,
        _key: data.selfLink as string,
        id: data.id as string,
        displayName: data.name as string,
        name: data.name,
        description: data.description,
        createdOn: getTime(data.creationTimestamp),
        category: ['network'],
        network: data.network,
        priority: data.priority,
        sourceRanges: data.sourceRanges,
        // A list of tags that controls which instances the firewall rule applies
        // to. If targetTags are specified, then the firewall rule applies only
        // to instances in the VPC network that have one of those tags. If no
        // targetTags are specified, the firewall rule applies to all instances
        // on the specified network.
        //
        // TODO: Make sure that we consider this when determining whether a
        // compute instance is "public" or not.
        targetTags: data.targetTags,
        // If source tags are specified, the firewall rule applies only to
        // traffic with source IPs that match the primary network interfaces of
        // VM instances that have the tag and are in the same VPC network.
        // Source tags cannot be used to control traffic to an instance's
        // external IP address, it only applies to traffic between instances in
        // the same virtual network. Because tags are associated with instances,
        // not IP addresses. One or both of sourceRanges and sourceTags may be
        // set. If both fields are set, the firewall applies to traffic that has
        // a source IP address within sourceRanges OR a source IP from a
        // resource with a matching tag listed in the sourceTags field. The
        // connection does not need to match both fields for the firewall to
        // apply.
        //
        // TODO: Make sure that we consider this when determining whether a
        // compute instance is "public" or not.
        sourceTags: data.sourceTags,
        allowed: JSON.stringify(data.allowed),
        denied: JSON.stringify(data.denied),
        ingress: data.direction === 'INGRESS',
        egress: data.direction === 'EGRESS',
        logConfigEnabled: data.logConfig?.enable,
        logConfigMetadata: data.logConfig?.metadata,
        disabled: data.disabled,
        destinationRanges: data.destinationRanges,
        /**
         * If source service accounts are specified, the firewall rules apply
         * only to traffic originating from an instance with a service account
         * in this list. Source service accounts cannot be used to control
         * traffic to an instance's external IP address because service
         * accounts are associated with an instance, not an IP address.
         * sourceRanges can be set at the same time as sourceServiceAccounts.
         * If both are set, the firewall applies to traffic that has a source
         * IP address within the sourceRanges OR a source IP that belongs to an
         * instance with service account listed in sourceServiceAccount. The
         * connection does not need to match both fields for the firewall to
         * apply. sourceServiceAccounts cannot be used at the same time as
         * sourceTags or targetTags.
         */
        sourceServiceAccounts: data.sourceServiceAccounts,
        /**
         * A list of service accounts indicating sets of instances located in
         * the network that may make network connections as specified in
         * allowed[]. targetServiceAccounts cannot be used at the same time as
         * targetTags or sourceTags. If neither targetServiceAccounts nor
         * targetTags are specified, the firewall rule applies to all instances
         * on the specified network.
         */
        targetServiceAccounts: data.targetServiceAccounts,
        public: false,
        internal: true,
      },
    },
  });
}

export function createComputeSubnetEntity(
  data: compute_v1.Schema$Subnetwork,
  projectId: string,
) {
  const regionName = parseRegionNameFromRegionUrl(data.region as string);

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_SUBNETWORK,
        _type: ENTITY_TYPE_COMPUTE_SUBNETWORK,
        _key: data.selfLink as string,
        id: data.id as string,
        displayName: data.name as string,
        description: data.description,
        name: data.name,
        createdOn: getTime(data.creationTimestamp),
        // Boolean that represents whether a subnet can access Google services
        // without assigning external IP addresses through Private Google
        // Access.
        //
        // See: https://cloud.google.com/compute/docs/reference/rest/v1/subnetworks/get
        privateIpGoogleAccess: data.privateIpGoogleAccess,
        // The purpose of the resource. This field can be either
        // PRIVATE_RFC_1918 or INTERNAL_HTTPS_LOAD_BALANCER. A subnetwork with
        // purpose set to INTERNAL_HTTPS_LOAD_BALANCER is a user-created
        // subnetwork that is reserved for Internal HTTP(S) Load Balancing. If
        // unspecified, the purpose defaults to PRIVATE_RFC_1918. The
        // enableFlowLogs field isn't supported with the purpose field set to
        // INTERNAL_HTTPS_LOAD_BALANCER.
        //
        // See: https://cloud.google.com/compute/docs/reference/rest/v1/subnetworks/get
        purpose: data.purpose,
        gatewayAddress: data.gatewayAddress,
        // 3.8 Ensure that VPC Flow Logs is enabled for every subnet in a VPC Network (Scored)
        flowLogsEnabled: data.logConfig?.enable === true,
        CIDR: data.ipCidrRange,
        public: false,
        internal: true,
        webLink: getGoogleCloudConsoleWebLink(
          `/networking/subnetworks/details/${regionName}/${data.name}?project=${projectId}`,
        ),
      },
    },
  });
}

export function createComputeNetworkEntity(
  data: compute_v1.Schema$Network,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_NETWORK,
        _type: ENTITY_TYPE_COMPUTE_NETWORK,
        _key: data.selfLink as string,
        id: data.id as string,
        displayName: data.name as string,
        description: data.description,
        name: data.name,
        createdOn: getTime(data.creationTimestamp),
        routingMode: data.routingConfig?.routingMode,
        autoCreateSubnetworks: data.autoCreateSubnetworks,
        subnetworks: data.subnetworks,
        // 3.2 Ensure legacy networks do not exist for a project (Scored)
        gatewayIPv4: data.gatewayIPv4,
        IPv4Range: data.IPv4Range,
        public: false,
        internal: true,
        CIDR: null,
        webLink: getGoogleCloudConsoleWebLink(
          `/networking/networks/details/${data.name}?project=${projectId}`,
        ),
      },
    },
  });
}

function getIpAddressVersion(
  ipAddressVersion: string | undefined | null,
): number | undefined {
  if (ipAddressVersion === 'IPV4') return 4;
  if (ipAddressVersion === 'IPV6') return 6;

  return undefined;
}

function getCommonGlobalAddressProps(
  data: compute_v1.Schema$Address,
  projectId: string,
) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    kind: data.kind,
    displayName: data.name as string,
    name: data.name,
    description: data.description,
    ipAddress: data.address,
    ipVersion: getIpAddressVersion(data.ipVersion),
    publicIpAddress: data.addressType === 'EXTERNAL' ? data.address : undefined,
    addressType: data.addressType,
    status: data.status,
    purpose: data.purpose,
    network: data.network,
    networkTier: data.networkTier,
    subnetwork: data.subnetwork,
    users: data.users,
    createdOn: parseTimePropertyValue(data.creationTimestamp),
    webLink: getGoogleCloudConsoleWebLink(
      `/networking/addresses/list?project=${projectId}`,
    ),
  };
}

export function createComputeGlobalAddressEntity(
  data: compute_v1.Schema$Address,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_GLOBAL_ADDRESS,
        _type: ENTITY_TYPE_COMPUTE_GLOBAL_ADDRESS,
        ...getCommonGlobalAddressProps(data, projectId),
      },
    },
  });
}

export function createComputeAddressEntity(
  data: compute_v1.Schema$Address,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_ADDRESS,
        _type: ENTITY_TYPE_COMPUTE_ADDRESS,
        ...getCommonGlobalAddressProps(data, projectId),
      },
    },
  });
}

function getCommonForwardingRuleProps(data: compute_v1.Schema$ForwardingRule) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    kind: data.kind,
    displayName: data.name as string,
    name: data.name,
    description: data.description,
    ipAddress: data.IPAddress,
    ipProtocol: data.IPProtocol,
    portRange: data.portRange,
    ports: data.ports,
    pscConnectionId: data.pscConnectionId,
    serviceName: data.serviceName,
    loadBalancingScheme: data.loadBalancingScheme,
    isMirroringCollector: data.isMirroringCollector,
    networkTier: data.networkTier,
    allPorts: data.allPorts,
    allowGlobalAccess: data.allowGlobalAccess,
    subnetwork: data.subnetwork,
    network: data.network,
    backendService: data.backendService,
    createdOn: parseTimePropertyValue(data.creationTimestamp),
  };
}

export function createComputeGlobalForwardingRuleEntity(
  data: compute_v1.Schema$ForwardingRule,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_GLOBAL_FORWARDING_RULE,
        _type: ENTITY_TYPE_COMPUTE_GLOBAL_FORWARDING_RULE,
        ...getCommonForwardingRuleProps(data),
      },
    },
  });
}

export function createComputeForwardingRuleEntity(
  data: compute_v1.Schema$ForwardingRule,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_FORWARDING_RULE,
        _type: ENTITY_TYPE_COMPUTE_FORWARDING_RULE,
        ...getCommonForwardingRuleProps(data),
      },
    },
  });
}

export function getAccessConfigProperties(
  accessConfig: compute_v1.Schema$AccessConfig,
) {
  return {
    accessConfigName: accessConfig.name,
    accessConfigNatIP: accessConfig.natIP,
    accessConfigNetworkTier: accessConfig.networkTier,
    accessConfigPublicPtrDomainName: accessConfig.publicPtrDomainName,
    accessConfigSetPublicPtr: accessConfig.setPublicPtr,
    // The only supported type in Google Cloud currently is "ONE_TO_ONE_NAT"
    accessConfigType: accessConfig.type,
  };
}

export function createSubnetHasComputeInstanceRelationship(params: {
  subnetEntity: Entity;
  computeInstanceEntity: Entity;
  networkInterface: compute_v1.Schema$NetworkInterface;
}): Relationship {
  const accessConfigProperties =
    params.networkInterface.accessConfigs &&
    params.networkInterface.accessConfigs.length &&
    // Only a single access config is supported.
    getAccessConfigProperties(params.networkInterface.accessConfigs[0]);

  const aliasIpRanges =
    params.networkInterface.aliasIpRanges &&
    params.networkInterface.aliasIpRanges
      .map((r) => r.ipCidrRange)
      .filter((r) => !!r);

  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: params.subnetEntity,
    to: params.computeInstanceEntity,
    properties: {
      networkIP: params.networkInterface.networkIP,
      ipv6Address: params.networkInterface.ipv6Address,
      networkInterfaceName: params.networkInterface.name,
      aliasIpRanges: JSON.stringify(aliasIpRanges),
      ...accessConfigProperties,
    },
  });
}

export function toFirewallRuleRelationshipKey({
  firewallEntity,
  portRange,
  ipRange,
  protocol,
  ruleIndex,
  protocolIndex,
}: {
  firewallEntity: Entity;
  portRange: string;
  ipRange: string;
  protocol: string;
  ruleIndex: number;
  protocolIndex: number;
}) {
  return `${firewallEntity._key}:${ruleIndex}:${protocol}:${protocolIndex}:${ipRange}:${portRange}`;
}

export function createFirewallRuleMappedRelationship({
  _class,
  relationshipDirection,
  firewallEntity,
  targetFilterKeys,
  targetEntity,
  properties,
}: {
  _class: RelationshipClass.ALLOWS | RelationshipClass.DENIES;
  relationshipDirection: RelationshipDirection;
  targetFilterKeys: TargetFilterKey[];
  targetEntity: Partial<PrimitiveEntity>;
  firewallEntity: Entity;
  properties: FirewallRuleRelationshipTargetProperties;
}) {
  const { ruleIndex, protocolIndex, ...propertiesWithoutIndices } = properties;

  return createMappedRelationship({
    _class,
    _mapping: {
      relationshipDirection,
      sourceEntityKey: firewallEntity._key,
      targetFilterKeys,
      targetEntity,
      skipTargetCreation: true,
    },
    properties: {
      _type: MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
      _key: toFirewallRuleRelationshipKey({
        firewallEntity,
        ipRange: properties.ipRange,
        portRange: properties.portRange,
        protocol: properties.ipProtocol,
        ruleIndex,
        protocolIndex,
      }),
      ...propertiesWithoutIndices,
    },
  });
}

function getCommonHealthCheckProps(data: compute_v1.Schema$HealthCheck) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    name: data.name,
    description: data.description,
    checkIntervalSec: data.checkIntervalSec,
    timeoutSec: data.timeoutSec,
    unhealthyThreshold: data.unhealthyThreshold,
    healthyThreshold: data.healthyThreshold,
    type: data.type,
    category: ['network'],
    function: ['validation'],
    createdOn: parseTimePropertyValue(data.creationTimestamp),
  };
}

export function createRegionHealthCheckEntity(
  data: compute_v1.Schema$HealthCheck,
  projectId: string,
) {
  const region = getLastUrlPart(data.region!);

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
        _type: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
        region,
        regional: true,
        ...getCommonHealthCheckProps(data),
        webLink: getGoogleCloudConsoleWebLink(
          `/compute/healthChecks/details/regions/${region}/${data.name}?project=${projectId}`,
        ),
      },
    },
  });
}

export function createHealthCheckEntity(
  data: compute_v1.Schema$HealthCheck,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_HEALTH_CHECK,
        _type: ENTITY_TYPE_COMPUTE_HEALTH_CHECK,
        regional: false,
        ...getCommonHealthCheckProps(data),
        webLink: getGoogleCloudConsoleWebLink(
          `/compute/healthChecks/details/${data.name}?project=${projectId}`,
        ),
      },
    },
  });
}

function getInstanceGroupWebLink({
  regionName,
  instanceGroupName,
  projectId,
}: {
  regionName: string;
  instanceGroupName: string;
  projectId: string;
}): string {
  return getGoogleCloudConsoleWebLink(
    `/compute/instanceGroups/details/${regionName}/${instanceGroupName}?project=${projectId}`,
  );
}

export function createInstanceGroupNamedPortEntity({
  instanceGroupId,
  instanceGroupName,
  namedPort,
  regionName,
  projectId,
}: {
  instanceGroupId: string;
  instanceGroupName: string;
  namedPort: compute_v1.Schema$NamedPort;
  regionName: string;
  projectId: string;
}) {
  return createGoogleCloudIntegrationEntity(namedPort, {
    entityData: {
      source: namedPort,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
        _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP_NAMED_PORT,
        _key: `instance_group_${instanceGroupId}_${namedPort.name}_${namedPort.port}`,
        instanceGroupId,
        instanceGroupName,
        name: namedPort.name,
        port: namedPort.port,
        webLink: getInstanceGroupWebLink({
          instanceGroupName,
          regionName,
          projectId,
        }),
      },
    },
  });
}

function getCommonInstanceGroupProps({
  data,
  regionName,
  projectId,
}: {
  data: compute_v1.Schema$InstanceGroup;
  regionName: string;
  projectId: string;
}) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    name: data.name,
    network: data.network,
    zone: data.zone,
    subnetwork: data.subnetwork,
    createdOn: parseTimePropertyValue(data.creationTimestamp),
    webLink: getInstanceGroupWebLink({
      instanceGroupName: data.name!,
      regionName,
      projectId,
    }),
  };
}

export function createRegionInstanceGroupEntity(
  data: compute_v1.Schema$InstanceGroup,
  projectId: string,
  regionName: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
        _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
        regional: true,
        ...getCommonInstanceGroupProps({
          data,
          projectId,
          regionName,
        }),
      },
    },
  });
}

export function createInstanceGroupEntity(
  data: compute_v1.Schema$InstanceGroup,
  projectId: string,
  regionName: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_INSTANCE_GROUP,
        _type: ENTITY_TYPE_COMPUTE_INSTANCE_GROUP,
        regional: false,
        ...getCommonInstanceGroupProps({
          data,
          projectId,
          regionName,
        }),
      },
    },
  });
}

function getCommonLoadBalancerProps(data: compute_v1.Schema$UrlMap) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    name: data.name,
    displayName: data.name as string,
    defaultService: data.defaultService,
    description: data.description,
    kind: data.kind,
    category: ['network'],
    function: ['load-balancing'],
    public: true,
    createdOn: parseTimePropertyValue(data.creationTimestamp),
  };
}

export function createRegionLoadBalancerEntity(data: compute_v1.Schema$UrlMap) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
        _type: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        region: data.region,
        regional: true,
        ...getCommonLoadBalancerProps(data),
      },
    },
  });
}

export function createLoadBalancerEntity(data: compute_v1.Schema$UrlMap) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_LOAD_BALANCER,
        _type: ENTITY_TYPE_COMPUTE_LOAD_BALANCER,
        regional: false,
        ...getCommonLoadBalancerProps(data),
      },
    },
  });
}

function getCommonBackendServiceProps(data: compute_v1.Schema$BackendService) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    name: data.name,
    displayName: data.name as string,
    timeoutSec: data.timeoutSec,
    port: data.port,
    protocol: data.protocol,
    enableCDN: data.enableCDN,
    category: ['network'],
    function: ['load-balancing'],
    createdOn: parseTimePropertyValue(data.creationTimestamp),
  };
}

export function createRegionBackendServiceEntity(
  data: compute_v1.Schema$BackendService,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
        _type: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        regional: true,
        ...getCommonBackendServiceProps(data),
      },
    },
  });
}

export function createBackendServiceEntity(
  data: compute_v1.Schema$BackendService,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_BACKEND_SERVICE,
        _type: ENTITY_TYPE_COMPUTE_BACKEND_SERVICE,
        regional: false,
        ...getCommonBackendServiceProps(data),
      },
    },
  });
}

export function createBackendBucketEntity(
  data: compute_v1.Schema$BackendBucket,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_BACKEND_BUCKET,
        _type: ENTITY_TYPE_COMPUTE_BACKEND_BUCKET,
        _key: data.selfLink as string,
        id: data.id as string,
        name: data.name,
        bucketName: data.bucketName,
        enableCdn: data.enableCdn,
        encrypted: true,
        category: ['network'],
        function: ['load-balancing'],
        public: true,
        createdOn: parseTimePropertyValue(data.creationTimestamp),
      },
    },
  });
}

export function createTargetSslProxyEntity(
  data: compute_v1.Schema$TargetSslProxy,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_TARGET_SSL_PROXY,
        _type: ENTITY_TYPE_COMPUTE_TARGET_SSL_PROXY,
        _key: data.selfLink as string,
        id: data.id as string,
        name: data.name,
        sslPolicy: data.sslPolicy,
        category: ['network'],
        function: ['load-balancing'],
        public: true,
        createdOn: parseTimePropertyValue(data.creationTimestamp),
      },
    },
  });
}

function getCommonTargetHttpsProxyProps(
  data: compute_v1.Schema$TargetHttpsProxy,
) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    name: data.name,
    sslPolicy: data.sslPolicy,
    category: ['network'],
    function: ['load-balancing'],
    public: true,
    createdOn: parseTimePropertyValue(data.creationTimestamp),
  };
}

export function createRegionTargetHttpsProxyEntity(
  data: compute_v1.Schema$TargetHttpsProxy,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
        regional: true,
        ...getCommonTargetHttpsProxyProps(data),
      },
    },
  });
}

export function createTargetHttpsProxyEntity(
  data: compute_v1.Schema$TargetHttpsProxy,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTPS_PROXY,
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTPS_PROXY,
        regional: false,
        ...getCommonTargetHttpsProxyProps(data),
      },
    },
  });
}

function getCommonTargetHttpProxyProps(
  data: compute_v1.Schema$TargetHttpProxy,
) {
  return {
    _key: data.selfLink as string,
    id: data.id as string,
    name: data.name,
    category: ['network'],
    function: ['load-balancing'],
    public: true,
    createdOn: parseTimePropertyValue(data.creationTimestamp),
  };
}

export function createRegionTargetHttpProxyEntity(
  data: compute_v1.Schema$TargetHttpProxy,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
        regional: true,
        ...getCommonTargetHttpProxyProps(data),
      },
    },
  });
}

export function createTargetHttpProxyEntity(
  data: compute_v1.Schema$TargetHttpProxy,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_TARGET_HTTP_PROXY,
        _type: ENTITY_TYPE_COMPUTE_TARGET_HTTP_PROXY,
        regional: false,
        ...getCommonTargetHttpProxyProps(data),
      },
    },
  });
}

export function createSslPolicyEntity(data: compute_v1.Schema$SslPolicy) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_COMPUTE_SSL_POLICY,
        _type: ENTITY_TYPE_COMPUTE_SSL_POLICY,
        _key: data.selfLink as string,
        id: data.id as string,
        name: data.name,
        minTlsVersion: data.minTlsVersion,
        profile: data.profile,
        customFeatures: data.customFeatures,
        title: 'SSL Policy',
        summary:
          'SSL policies give you the ability to control the features of SSL that your Google Cloud SSL proxy load balancer or external HTTP(S) load balancer negotiates with clients.',
        content: '',
        createdOn: parseTimePropertyValue(data.creationTimestamp),
      },
    },
  });
}
