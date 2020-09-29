import { iam_v1, compute_v1 } from 'googleapis';

export function getMockIamRole(
  partial?: Partial<iam_v1.Schema$Role>,
): iam_v1.Schema$Role {
  return {
    name: 'projects/j1-gc-integration-dev/roles/myrole',
    title: 'Role',
    description: 'Description',
    includedPermissions: [
      'cloudfunctions.functions.get',
      'cloudfunctions.functions.getIamPolicy',
    ],
    stage: 'GA',
    etag: 'abc123',
    ...partial,
  };
}

export function getMockServiceAccount(
  partial?: Partial<iam_v1.Schema$ServiceAccount>,
): iam_v1.Schema$ServiceAccount {
  return {
    name:
      'projects/j1-gc-integration-dev/serviceAccounts/j1-gc-integration-dev-sa@j1-gc-integration-dev.iam.gserviceaccount.com',
    projectId: 'j1-gc-integration-dev',
    uniqueId: '1234567890',
    email:
      'j1-gc-integration-dev-sa@j1-gc-integration-dev.iam.gserviceaccount.com',
    etag: 'abc=',
    description: 'J1 Google Cloud integration execution',
    oauth2ClientId: '1234567890',
    ...partial,
  };
}

export function getMockServiceAccountKey(
  partial?: Partial<iam_v1.Schema$ServiceAccountKey>,
): iam_v1.Schema$ServiceAccountKey {
  return {
    name:
      'projects/j1-gc-integration-dev/serviceAccounts/j1-gc-integration-dev-sa-tf@j1-gc-integration-dev.iam.gserviceaccount.com/keys/12345',
    validAfterTime: '2020-08-05T18:05:19Z',
    validBeforeTime: '2020-08-21T18:05:19Z',
    keyAlgorithm: 'KEY_ALG_RSA_2048',
    keyOrigin: 'GOOGLE_PROVIDED',
    keyType: 'SYSTEM_MANAGED',
    ...partial,
  };
}

export function getMockComputeDisk(
  partial?: Partial<compute_v1.Schema$Disk>,
): compute_v1.Schema$Disk {
  return {
    id: '123456789',
    creationTimestamp: '2020-08-12T08:20:05.930-07:00',
    name: 'testvm',
    sizeGb: '10',
    zone:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a',
    status: 'READY',
    selfLink:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a/disks/testvm',
    sourceImage:
      'https://www.googleapis.com/compute/v1/projects/debian-cloud/global/images/debian-9-stretch-v20200805',
    sourceImageId: '6709658075886210235',
    type:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a/diskTypes/pd-standard',
    licenses: [
      'https://www.googleapis.com/compute/v1/projects/debian-cloud/global/licenses/debian-9-stretch',
    ],
    guestOsFeatures: [
      {
        type: 'VIRTIO_SCSI_MULTIQUEUE',
      },
    ],
    lastAttachTimestamp: '2020-08-12T08:20:05.930-07:00',
    users: [
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a/instances/testvm',
    ],
    labelFingerprint: '42WmSpB8rSM=',
    licenseCodes: ['1000205'],
    physicalBlockSizeBytes: '4096',
    kind: 'compute#disk',
    ...partial,
  };
}

export function getMockComputeInstance(
  partial?: Partial<compute_v1.Schema$Instance>,
): compute_v1.Schema$Instance {
  return {
    id: '2248191918776890954',
    creationTimestamp: '2020-08-12T08:20:05.921-07:00',
    name: 'testvm',
    tags: {
      items: ['testvmtag1', 'testvmtag2'],
      fingerprint: 'f_TpKvEudUc=',
    },
    machineType:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a/machineTypes/n1-standard-1',
    status: 'RUNNING',
    zone:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a',
    canIpForward: false,
    networkInterfaces: [
      {
        network:
          'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/global/networks/default',
        subnetwork:
          'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/regions/us-central1/subnetworks/default',
        networkIP: '10.128.0.2',
        name: 'nic0',
        fingerprint: 'RpvQNHzHRp8=',
        kind: 'compute#networkInterface',
      },
    ],
    disks: [
      {
        type: 'PERSISTENT',
        mode: 'READ_WRITE',
        source:
          'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a/disks/testvm',
        deviceName: 'persistent-disk-0',
        index: 0,
        boot: true,
        autoDelete: true,
        licenses: [
          'https://www.googleapis.com/compute/v1/projects/debian-cloud/global/licenses/debian-9-stretch',
        ],
        interface: 'SCSI',
        guestOsFeatures: [
          {
            type: 'VIRTIO_SCSI_MULTIQUEUE',
          },
        ],
        diskSizeGb: '10',
        kind: 'compute#attachedDisk',
      },
      {
        type: 'SCRATCH',
        mode: 'READ_WRITE',
        deviceName: 'local-ssd-0',
        index: 1,
        boot: false,
        autoDelete: true,
        interface: 'SCSI',
        diskSizeGb: '375',
        kind: 'compute#attachedDisk',
      },
    ],
    metadata: {
      fingerprint: '9yLGkjCLBTs=',
      items: [
        {
          key: 'foo',
          value: 'bar',
        },
        {
          key: 'startup-script',
          value: 'echo Hello',
        },
      ],
      kind: 'compute#metadata',
    },
    serviceAccounts: [
      {
        email:
          'j1-gc-integration-dev-sa-tf@j1-gc-integration-dev.iam.gserviceaccount.com',
        scopes: [
          'https://www.googleapis.com/auth/compute.readonly',
          'https://www.googleapis.com/auth/devstorage.read_only',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
      },
    ],
    selfLink:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/zones/us-central1-a/instances/testvm',
    scheduling: {
      onHostMaintenance: 'MIGRATE',
      automaticRestart: true,
      preemptible: false,
    },
    cpuPlatform: 'Intel Haswell',
    labelFingerprint: '42WmSpB8rSM=',
    startRestricted: false,
    deletionProtection: false,
    fingerprint: '4gmEF7tlfn8=',
    kind: 'compute#instance',
    ...partial,
  };
}

export function getMockComputeFirewall(
  partial?: compute_v1.Schema$Firewall,
): compute_v1.Schema$Firewall {
  return {
    id: '1234567890',
    creationTimestamp: '2020-09-23T07:47:24.809-07:00',
    name: 'public-compute-app-fw-allow-https',
    description: '',
    network:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/global/networks/public-compute-app-vpc',
    priority: 1000,
    sourceRanges: ['0.0.0.0/0'],
    targetTags: ['https'],
    allowed: [
      {
        IPProtocol: 'tcp',
        ports: ['443'],
      },
    ],
    direction: 'INGRESS',
    logConfig: {
      enable: false,
    },
    disabled: false,
    selfLink:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/global/firewalls/public-compute-app-fw-allow-https',
    kind: 'compute#firewall',
    ...partial,
  };
}

export function getMockSubnet(
  partial?: compute_v1.Schema$Subnetwork,
): compute_v1.Schema$Subnetwork {
  return {
    id: '1234567890',
    creationTimestamp: '2020-08-07T10:20:16.033-07:00',
    name: 'default',
    network:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/global/networks/default',
    ipCidrRange: '10.164.0.0/20',
    gatewayAddress: '10.164.0.1',
    region:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/regions/europe-west4',
    selfLink:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/regions/europe-west4/subnetworks/default',
    privateIpGoogleAccess: false,
    fingerprint: 'whfZBEBCda4=',
    privateIpv6GoogleAccess: 'DISABLE_GOOGLE_ACCESS',
    purpose: 'PRIVATE',
    kind: 'compute#subnetwork',
    ...partial,
  };
}

export function getMockNetwork(
  partial?: compute_v1.Schema$Network,
): compute_v1.Schema$Network {
  return {
    id: '4319333979087364382',
    creationTimestamp: '2020-09-23T07:47:13.320-07:00',
    name: 'public-compute-app-vpc',
    selfLink:
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/global/networks/public-compute-app-vpc',
    autoCreateSubnetworks: false,
    subnetworks: [
      'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/regions/us-central1/subnetworks/public-compute-app-public-subnet-1',
    ],
    routingConfig: {
      routingMode: 'GLOBAL',
    },
    kind: 'compute#network',
    ...partial,
  };
}
