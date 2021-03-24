import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { pubsub_v1 } from 'googleapis';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { ENTITY_TYPE_KMS_KEY, STEP_CLOUD_KMS_KEYS } from '../kms';
import { PubSubClient } from './client';
import {
  ENTITY_CLASS_PUBSUB_TOPIC,
  ENTITY_TYPE_PUBSUB_TOPIC,
  STEP_PUBSUB_TOPICS,
  STEP_PUBSUB_SUBSCRIPTIONS,
  RELATIONSHIP_TYPE_PUBSUB_TOPIC_HAS_KMS_KEY,
  RELATIONSHIP_TYPE_PUBSUB_SUBSCRIPTION_USES_TOPIC,
  ENTITY_CLASS_PUBSUB_SUBSCRIPTION,
  ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
} from './constants';
import {
  createPubSubSubscriptionEntity,
  createPubSubTopicEntity,
} from './converters';
import { isMemberPublic } from '../../utils/iam';

function isTopicPolicyPublicAccess(
  topicPolicy: pubsub_v1.Schema$Policy,
): boolean {
  for (const binding of topicPolicy.bindings || []) {
    for (const member of binding.members || []) {
      if (isMemberPublic(member)) {
        return true;
      }
    }
  }

  return false;
}

export async function fetchPubSubTopics(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new PubSubClient({ config });

  await client.iterateProjectTopics(async (projectTopic) => {
    const topicPolicy = await client.getPolicy(projectTopic.name as string);

    const projectTopicEntity = createPubSubTopicEntity({
      data: projectTopic,
      projectId: client.projectId,
      isPublic: isTopicPolicyPublicAccess(topicPolicy),
    });
    await jobState.addEntity(projectTopicEntity);

    if (projectTopic.kmsKeyName) {
      const kmsKeyEntity = await jobState.findEntity(projectTopic.kmsKeyName);
      if (kmsKeyEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: projectTopicEntity,
            to: kmsKeyEntity,
          }),
        );
      }
    }
  });
}

export async function fetchPubSubSubscriptions(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new PubSubClient({ config });

  await client.iterateProjectSubscriptions(async (projectSubscription) => {
    const projectSubscriptionEntity = createPubSubSubscriptionEntity(
      projectSubscription,
      client.projectId,
    );

    await jobState.addEntity(projectSubscriptionEntity);

    // Google Cloud subscriptions whose topic has been deleted have a `topic` property with value `_deleted-topic_`
    // Detached subscriptions don't receive messages from their topic and don't retain any backlog.
    if (
      projectSubscription.topic &&
      projectSubscription.topic !== '_deleted-topic_' &&
      !projectSubscription.detached
    ) {
      const projectTopicEntity = await jobState.findEntity(
        projectSubscription.topic,
      );
      if (projectTopicEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: projectSubscriptionEntity,
            to: projectTopicEntity,
          }),
        );
      }
    }
  });
}

export const pubSubSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_PUBSUB_TOPICS,
    name: 'PubSub Topics',
    entities: [
      {
        resourceName: 'PubSub Topic',
        _type: ENTITY_TYPE_PUBSUB_TOPIC,
        _class: ENTITY_CLASS_PUBSUB_TOPIC,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_PUBSUB_TOPIC_HAS_KMS_KEY,
        sourceType: ENTITY_TYPE_PUBSUB_TOPIC,
        targetType: ENTITY_TYPE_KMS_KEY,
      },
    ],
    dependsOn: [STEP_CLOUD_KMS_KEYS],
    executionHandler: fetchPubSubTopics,
  },
  {
    id: STEP_PUBSUB_SUBSCRIPTIONS,
    name: 'PubSub Subscriptions',
    entities: [
      {
        resourceName: 'PubSub Subscription',
        _type: ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
        _class: ENTITY_CLASS_PUBSUB_SUBSCRIPTION,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_PUBSUB_SUBSCRIPTION_USES_TOPIC,
        sourceType: ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
        targetType: ENTITY_TYPE_PUBSUB_TOPIC,
      },
    ],
    dependsOn: [STEP_PUBSUB_TOPICS],
    executionHandler: fetchPubSubSubscriptions,
  },
];
