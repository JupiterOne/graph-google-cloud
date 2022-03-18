export const STEP_PUBSUB_TOPICS = 'fetch-pubsub-topics';
export const STEP_CREATE_PUBSUB_TOPIC_KMS_RELATIONSHIPS =
  'build-pubsub-topic-kms-relationships';
export const STEP_PUBSUB_SUBSCRIPTIONS = 'fetch-pubsub-subscriptions';

export const ENTITY_TYPE_PUBSUB_TOPIC = 'google_pubsub_topic';
export const ENTITY_CLASS_PUBSUB_TOPIC = 'Channel';

export const ENTITY_TYPE_PUBSUB_SUBSCRIPTION = 'google_pubsub_subscription';
export const ENTITY_CLASS_PUBSUB_SUBSCRIPTION = 'Service';

export const RELATIONSHIP_TYPE_PUBSUB_TOPIC_USES_KMS_KEY =
  'google_pubsub_topic_uses_kms_crypto_key';

export const RELATIONSHIP_TYPE_PUBSUB_SUBSCRIPTION_USES_TOPIC =
  'google_pubsub_subscription_uses_topic';
