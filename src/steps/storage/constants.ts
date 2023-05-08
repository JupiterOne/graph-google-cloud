export const StorageStepsSpec = {
  FETCH_STORAGE_BUCKETS: {
    id: 'fetch-cloud-storage-buckets',
    name: 'Cloud Storage Buckets',
  },
};

export const StorageEntitiesSpec = {
  STORAGE_BUCKET: {
    resourceName: 'Cloud Storage Bucket',
    _type: 'google_storage_bucket',
    _class: ['DataStore'],
  },
};
