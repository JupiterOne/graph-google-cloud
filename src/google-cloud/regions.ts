export interface GoogleCloudRegion {
  name: string;
  zones: string[];
}

/**
 * Compute resources are deployed to specific geographical regions and a zone
 * in that region. Supported regions and zones can be found here:
 *
 * https://cloud.google.com/compute/docs/regions-zones#locations
 */
export const googleCloudRegions: GoogleCloudRegion[] = [
  {
    name: 'asia-east1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-east2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-northeast1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-northeast2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-northeast3',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-south1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-south2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-southeast1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'asia-southeast2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'australia-southeast1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'australia-southeast2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-central2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-north1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-southwest1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-west1',
    zones: ['b', 'c', 'd'],
  },
  {
    name: 'europe-west2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-west3',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-west4',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-west6',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-west8',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'europe-west9',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'northamerica-northeast1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'northamerica-northeast2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'southamerica-east1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'southamerica-west1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'us-central1',
    zones: ['a', 'b', 'c', 'f'],
  },
  {
    name: 'us-east1',
    zones: ['b', 'c', 'd'],
  },
  {
    name: 'us-east4',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'us-east5',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'us-south1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'us-west1',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'us-west2',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'us-west3',
    zones: ['a', 'b', 'c'],
  },
  {
    name: 'us-west4',
    zones: ['a', 'b', 'c'],
  },
];

/**
 * Some Google Cloud services (e.g. Compute) are region specific. APIs may
 * need to be invoked for all regions and zones.
 */
export async function iterateRegionZones(
  callback: (zone: string) => Promise<void>,
) {
  for (const region of googleCloudRegions) {
    for (const zone of region.zones) {
      await callback(`${region.name}-${zone}`); // e.g. us-central1-a
    }
  }
}

/**
 * Some Google Cloud services (e.g. Compute) are region specific. APIs may
 * need to be invoked for just all the regions but not zones.
 */
export async function iterateRegions(
  callback: (region: string) => Promise<void>,
) {
  for (const region of googleCloudRegions) {
    await callback(region.name); // e.g. us-central1
  }
}

/**
 * Example:
 *
 * Input: 'https://www.googleapis.com/compute/v1/projects/j1-gc-integration-dev/regions/asia-southeast1'
 * Output: 'asia-southeast1'
 */
export function parseRegionNameFromRegionUrl(regionUrl: string) {
  const parts = regionUrl.split('/');
  return parts[parts.length - 1];
}
