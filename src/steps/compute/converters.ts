import { compute_v1 } from 'googleapis';
import {
  createIntegrationEntity,
  getTime,
  createDirectRelationship,
  Entity,
} from '@jupiterone/integration-sdk-core';
import {
  ENTITY_CLASS_COMPUTE_DISK,
  ENTITY_TYPE_COMPUTE_DISK,
  ENTITY_CLASS_COMPUTE_INSTANCE,
  ENTITY_TYPE_COMPUTE_INSTANCE,
} from './constants';
import { getLastUrlPart } from '../../utils/url';

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

export function createComputeInstanceEntity(data: compute_v1.Schema$Instance) {
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
        labelFingerprint: data.labelFingerprint,
        startRestricted: data.startRestricted,
        deletionProtection: data.deletionProtection,
        fingerprint: data.fingerprint,
        kind: data.kind,
        hostname: null,
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
    _class: 'USES',
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
