import { compute_v1 } from 'googleapis';
import {
  createIntegrationEntity,
  getTime,
  createDirectRelationship,
  Entity,
  RelationshipClass,
  Relationship,
  createMappedRelationship,
  RelationshipDirection,
  TargetFilterKey,
  PrimitiveEntity,
} from '@jupiterone/integration-sdk-core';
import {
  ENTITY_CLASS_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_CLASS_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_INSTANCE,
  ENTITY_CLASS_COMPUTE_NETWORK,
  ENTITY_TYPE_COMPUTE_NETWORK,
  ENTITY_CLASS_COMPUTE_SUBNETWORK,
  ENTITY_TYPE_COMPUTE_SUBNETWORK,
  ENTITY_CLASS_COMPUTE_FIREWALL,
  ENTITY_TYPE_COMPUTE_FIREWALL,
  MAPPED_RELATIONSHIP_FIREWALL_RULE_TYPE,
} from './constants';
import { getGoogleCloudConsoleWebLink, getLastUrlPart } from '../../utils/url';
import { parseRegionNameFromRegionUrl } from '../../google-cloud/regions';
import { FirewallRuleRelationshipTargetProperties } from '../../utils/firewall';

export function createComputeDiskEntity(data: compute_v1.Schema$Disk) {
  return createIntegrationEntity({
    entityData: {
      source: {
        ...data,
        tags: buildComputeInstanceTags(data),
      },
      assign: {
        _class: ENTITY_CLASS_COMPUTE_DISK,
        _type: ENTITY_TYPE_COMPUTE_DISK,
        _key: data.selfLink as string,
        id: data.id as string,
        displayName: data.name as string,
        description: data.description,
        name: data.name,
        createdOn: getTime(data.creationTimestamp),
        zone: data.zone && getLastUrlPart(data.zone),
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
        sourceImage: data.sourceImage,
        sourceImageId: data.sourceImageId,
        type: data.type && getLastUrlPart(data.type),
        licenses: data.licenses,
        guestOsFeatures:
          data.guestOsFeatures &&
          (data.guestOsFeatures.map((g) => g.type) as string[]),
        lastAttachTimestamp: getTime(data.lastAttachTimestamp),
        labelFingerprint: data.labelFingerprint,
        licenseCodes: data.licenseCodes,
        physicalBlockSizeBytes: data.physicalBlockSizeBytes,
        // 4.7 Ensure VM disks for critical VMs are encrypted with Customer-Supplied Encryption Keys (CSEK)
        isCustomerSuppliedKeysEncrypted:
          data.diskEncryptionKey?.sha256 !== undefined,
        kind: data.kind,
        // Compute disks are encrypted by default
        encrypted: true,
        // If `classification` is not included in tags, we do not know how to
        // classify it.
        classification: null,
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
function getBlockProjectSSHKeysValue(
  name: string,
  metadata?: compute_v1.Schema$Metadata,
): boolean | undefined {
  /*
    Exception:
    VMs created by GKE should be excluded. These VMs have names that start with gke- and are labeled goog-gke-node
  */
  if (name.startsWith('gke-') || !metadata) {
    return undefined;
  }

  /* 
    We usually don't want to map original values, however this one returns true/false as a string
    It might be confusing if JupiterOne contained fields where true/false can be found in both string and boolean forms?
   */
  const value = metadata.items?.find(
    (item) => item.key === 'block-project-ssh-keys',
  )?.value;

  return value ? value === 'true' : undefined;
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
    "enableIntegrityMonitoring": true
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
    shieldedInstanceConfig.enableIntegrityMonitoring
    ? true
    : false;
}

export function createComputeInstanceEntity(data: compute_v1.Schema$Instance) {
  const ipAddresses = getIpAddressesForComputeInstance(data);

  return createIntegrationEntity({
    entityData: {
      source: {
        ...data,
        tags: buildComputeInstanceTags(data),
      },
      assign: {
        _class: ENTITY_CLASS_COMPUTE_INSTANCE,
        _type: ENTITY_TYPE_COMPUTE_INSTANCE,
        _key: data.selfLink as string,
        id: data.id as string,
        displayName: data.name as string,
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
        zone: data.zone && getLastUrlPart(data.zone),
        canIpForward: data.canIpForward,
        cpuPlatform: data.cpuPlatform,
        ...getDefaultServiceAccountUsage(
          data.name as string,
          data.serviceAccounts,
        ),
        blockProjectSSHKeys: getBlockProjectSSHKeysValue(
          data.name as string,
          data.metadata,
        ),
        isSerialPortEnabled: isSerialPortEnabled(data.metadata),
        isShieldedVM: isShieldedVM(data.shieldedInstanceConfig),
        labelFingerprint: data.labelFingerprint,
        startRestricted: data.startRestricted,
        deletionProtection: data.deletionProtection,
        fingerprint: data.fingerprint,
        kind: data.kind,
        publicIpAddress: ipAddresses.publicIpAddresses,
        privateIpAddress: ipAddresses.privateIpAddresses,
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
  return createIntegrationEntity({
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

  return createIntegrationEntity({
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
  return createIntegrationEntity({
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
        gatewayIPv4: data.gatewayIPv4,
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
}: {
  firewallEntity: Entity;
  portRange: string;
  ipRange: string;
  protocol: string;
}) {
  return `${firewallEntity._key}:${protocol}:${ipRange}:${portRange}`;
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
      }),
      ...properties,
    },
  });
}
