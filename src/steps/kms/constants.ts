export const STEP_CLOUD_KMS_KEY_RINGS = 'fetch-kms-key-rings';
export const STEP_CLOUD_KMS_KEYS = 'fetch-kms-keys';

export const ENTITY_TYPE_KMS_KEY_RING = 'google_kms_key_ring';
export const ENTITY_CLASS_KMS_KEY_RING = 'Vault';
export const ENTITY_TYPE_KMS_KEY = 'google_kms_crypto_key';
export const ENTITY_CLASS_KMS_KEY = ['Key', 'CryptoKey'];

export const RELATIONSHIP_TYPE_KMS_KEY_RING_HAS_KMS_KEY =
  'google_kms_key_ring_has_crypto_key';

// Fetched directly from the `projects.locations.list` KMS API
//
// See: https://cloud.google.com/kms/docs/locations#regional
export const KMS_SERVICE_LOCATIONS: string[] = [
  'asia',
  'asia-east1',
  'asia-east2',
  'asia-northeast1',
  'asia-northeast2',
  'asia-northeast3',
  'asia-south1',
  'asia-south2',
  'asia-southeast1',
  'asia-southeast2',
  'asia1',
  'australia-southeast1',
  'australia-southeast2',
  'eur3',
  'eur4',
  'eur5',
  'eur6',
  'europe',
  'europe-central2',
  'europe-north1',
  'europe-southwest1',
  'europe-west1',
  'europe-west2',
  'europe-west3',
  'europe-west4',
  'europe-west6',
  'europe-west8',
  'europe-west9',
  'global',
  'nam-eur-asia1',
  'nam10',
  'nam11',
  'nam12',
  'nam3',
  'nam4',
  'nam6',
  'nam7',
  'nam8',
  'nam9',
  'northamerica-northeast1',
  'northamerica-northeast2',
  'southamerica-east1',
  'southamerica-west1',
  'us',
  'us-central1',
  'us-east1',
  'us-east4',
  'us-east5',
  'us-south1',
  'us-west1',
  'us-west2',
  'us-west3',
  'us-west4',
];
