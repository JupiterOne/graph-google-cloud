import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { pubsub_v1 } from 'googleapis';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  ENTITY_CLASS_PUBSUB_SUBSCRIPTION,
  ENTITY_CLASS_PUBSUB_TOPIC,
  ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
  ENTITY_TYPE_PUBSUB_TOPIC,
} from './constants';

export function createPubSubTopicEntity({
  data,
  projectId,
  isPublic,
}: {
  data: pubsub_v1.Schema$Topic;
  projectId: string;
  isPublic: boolean;
}) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_PUBSUB_TOPIC,
        _type: ENTITY_TYPE_PUBSUB_TOPIC,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        kmsKeyName: data.kmsKeyName,
        category: ['application'],
        function: ['other'],
        public: isPublic,
        webLink: getGoogleCloudConsoleWebLink(
          `/cloudpubsub/topic/detail/${data.name?.split(
            '/',
          )[3]}?project=${projectId}`,
        ),
      },
    },
  });
}

export function createPubSubSubscriptionEntity(
  data: pubsub_v1.Schema$Subscription,
  projectId: string,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_PUBSUB_SUBSCRIPTION,
        _type: ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
        _key: data.name as string,
        name: data.name,
        displayName: data.name as string,
        ackDeadlineSeconds: data.ackDeadlineSeconds,
        messageRetentionDuration: data.messageRetentionDuration,
        // to match the AWS's name (https://ask.us.jupiterone.io/question/fde829cb832be99676b24e6da048cc9d7aca087f)
        deadLetter: data.deadLetterPolicy ? true : false,
        enableMessageOrdering: data.enableMessageOrdering || false,
        expirationPolicyTtl: data.expirationPolicy?.ttl,
        category: ['application'],
        function: ['notification'],
        isDetached: data.detached,
        pushEndpoint: data.pushConfig?.pushEndpoint,
        isDefaultRetryPolicy: data.retryPolicy === undefined,
        minimumBackoff: data.retryPolicy?.minimumBackoff,
        maximumBackoff: data.retryPolicy?.maximumBackoff,
        webLink: getGoogleCloudConsoleWebLink(
          `/cloudpubsub/subscription/detail/${data.name?.split(
            '/',
          )[3]}?project=${projectId}`,
        ),
      },
    },
  });
}
