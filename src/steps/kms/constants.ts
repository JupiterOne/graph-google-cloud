export const STEP_CLOUD_KMS_KEY_RINGS = 'fetch-kms-key-rings';
export const STEP_CLOUD_KMS_KEYS = 'fetch-kms-keys';

export const ENTITY_TYPE_KMS_KEY_RING = 'google_kms_key_ring';
export const ENTITY_CLASS_KMS_KEY_RING = 'Vault';
export const ENTITY_TYPE_KMS_KEY = 'google_kms_crypto_key';
export const ENTITY_CLASS_KMS_KEY = ['Key', 'CryptoKey'];

export const RELATIONSHIP_TYPE_KMS_KEY_RING_HAS_KMS_KEY =
  'google_kms_key_ring_has_crypto_key';
