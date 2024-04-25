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

export const IngestionSources = {
  STORAGE_BUCKETS: 'storage-buckets',
};

export const StorageIngestionConfig = {
  [IngestionSources.STORAGE_BUCKETS]: {
    title: 'Google Cloud Storage Buckets',
    description: 'Object storage for large-scale data.',
    defaultsToDisabled: false,
  },
};

export const StoragePermissions = {
  FETCH_STORAGE_BUCKETS: [
    'orgpolicy.policies.list',
    'orgpolicy.policy.get',
    'storage.buckets.list',
    'storage.buckets.getIamPolicy',
  ],
};
