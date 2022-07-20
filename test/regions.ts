import * as regions from '../src/google-cloud/regions';

/**
 * All tests in this project were originally set up with the GCP regions that
 * existed in 2020. As new regions are added to GCP, we need to prevent the old
 * recording tests from hitting the new regions with old credentials, as they
 * will always return with a `401`.
 *
 * In the future, this project should do what `graph-aws` does in tests, forcing
 * tests to record just _one_ region. This will also drastically cut down on the
 * size of recordings in this project.
 *
 * See https://github.com/JupiterOne/graph-aws/blob/main/test/config.ts#L53
 */
export function omitNewRegionsFromTests() {
  const newRegions = [
    'asia-south2',
    'australia-southeast2',
    'europe-central2',
    'europe-southwest1',
    'europe-west8',
    'europe-west9',
    'northamerica-northeast2',
    'southamerica-west1',
    'us-east5',
    'us-south1',
  ];

  const googleCloudRegionsForTests = regions.googleCloudRegions.filter(
    (r) => !newRegions.includes(r.name),
  );

  jest.mock('../src/google-cloud/regions', () => {
    return {
      ...jest.requireActual('../src/google-cloud/regions'),
      iterateRegions: async (callback) => {
        for (const region of googleCloudRegionsForTests) {
          await callback(region.name); // e.g. us-central1
        }
      },
      iterateRegionZones: async (callback) => {
        for (const region of googleCloudRegionsForTests) {
          for (const zone of region.zones) {
            await callback(`${region.name}-${zone}`); // e.g. us-central1-a
          }
        }
      },
    };
  });
}
