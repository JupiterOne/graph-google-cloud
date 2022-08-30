export const CloudBuildStepsSpec = {
  FETCH_BUILDS: {
    id: 'fetch-cloud-builds',
    name: 'Fetch Cloud Builds',
  },
  FETCH_BUILD_TRIGGERS: {
    id: 'fetch-cloud-build-triggers',
    name: 'Fetch Cloud Build Triggers',
  },
  FETCH_BUILD_WORKER_POOLS: {
    id: 'fetch-cloud-build-worker-pools',
    name: 'Fetch Cloud Build Worker Pools',
  },
};

export const CloudBuildEntitiesSpec = {
  BUILD: {
    resourceName: 'Cloud Build',
    _type: 'google_cloud_build',
    _class: ['Secret'],
  },
  BUILD_TRIGGER: {
    resourceName: 'Cloud Build Trigger',
    _type: 'google_cloud_build_trigger',
    _class: ['Rule'],
  },
  BUILD_WORKER_POOL: {
    resourceName: 'Cloud Build Worker Pool',
    _type: 'google_cloud_build_worker_pool',
    _class: ['Cluster'],
  },
};

export const CloudBuildRelationshipsSpec = {};

// https://cloud.google.com/build/docs/locations
export const CloudBuildLocations = [
  'asia-south1',
  'asia-south2',
  'asia-southeast1',
  'asia-southeast2',
  'australia-southeast1',
  'australia-southeast2',
  'europe-central2',
  'europe-north1',
  'europe-west1',
  'europe-west2',
  'europe-west3',
  'europe-west4',
  'europe-west6',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us-central1',
  'us-east1',
  'us-east4',
  'us-west1',
  'us-west2',
  'us-west3',
  'us-west4',
];
