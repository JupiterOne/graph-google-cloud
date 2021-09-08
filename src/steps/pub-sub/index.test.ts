import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
  ENTITY_TYPE_PUBSUB_TOPIC,
  RELATIONSHIP_TYPE_PUBSUB_SUBSCRIPTION_USES_TOPIC,
  RELATIONSHIP_TYPE_PUBSUB_TOPIC_USES_KMS_KEY,
} from './constants';
import { fetchPubSubSubscriptions, fetchPubSubTopics } from '.';
import {
  ENTITY_TYPE_KMS_KEY,
  fetchKmsCryptoKeys,
  fetchKmsKeyRings,
} from '../kms';
import { separateDirectMappedRelationships } from '../../../test/helpers/separateDirectMappedRelationships';

describe('#fetchProjectTopics', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchProjectTopics',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    await fetchKmsKeyRings(context);
    await fetchKmsCryptoKeys(context);
    await fetchPubSubTopics(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_PUBSUB_TOPIC,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Channel'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_pubsub_topic' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          kmsKeyName: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_KMS_KEY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Key', 'CryptoKey'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_kms_crypto_key' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          projectId: { type: 'string' },
          location: { type: 'string' },
          shortName: { type: 'string' },
          purpose: { type: 'string' },
          keyUsage: { type: 'string' },
          nextRotationTime: { type: 'number' },
          rotationPeriod: { type: 'number' },
          protectionLevel: { type: 'string' },
          algorithm: { type: 'string' },
          public: { type: 'boolean' },
          primaryName: { type: 'string' },
          primaryState: { type: 'string' },
          primaryCreateTime: { type: 'number' },
          primaryProtectionLevel: { type: 'string' },
          primaryAlgorithm: { type: 'string' },
          primaryGenerateTime: { type: 'number' },
        },
      },
    });

    const { directRelationships, mappedRelationships: mappedKmsRelationships } =
      separateDirectMappedRelationships(
        context.jobState.collectedRelationships,
      );

    expect(
      directRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PUBSUB_TOPIC_USES_KMS_KEY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_pubsub_topic_uses_kms_crypto_key' },
        },
      },
    });

    expect(mappedKmsRelationships.length).toBeGreaterThan(0);

    expect(
      mappedKmsRelationships
        .filter(
          (e) =>
            e._mapping.sourceEntityKey ===
            'projects/j1-gc-integration-dev-v3/topics/sample-topic-foreign-key',
        )
        .every(
          (mappedRelationship) =>
            mappedRelationship._key ===
            'projects/j1-gc-integration-dev-v3/topics/sample-topic-foreign-key|uses|projects/vmware-account/locations/global/keyRings/test-key-ring/cryptoKeys/foreign-key',
        ),
    ).toBe(true);
  });
});

describe('#fetchProjectSubscriptions', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchProjectSubscriptions',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchPubSubTopics(context);
    await fetchPubSubSubscriptions(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_PUBSUB_TOPIC,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Channel'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_pubsub_topic' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          kmsKeyName: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_PUBSUB_SUBSCRIPTION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_pubsub_subscription' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          ackDeadlineSeconds: { type: 'number' },
          messageRetentionDuration: { type: 'string' },
          deadLetter: { type: 'boolean' },
          enableMessageOrdering: { type: 'boolean' },
          expirationPolicyTtl: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          function: {
            type: 'array',
            items: { type: 'string' },
          },
          isDetached: { type: 'boolean' },
          pushEndpoint: { type: 'string' },
          isDefaultRetryPolicy: { type: 'boolean' },
          minimumBackoff: { type: 'string' },
          maximumBackoff: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PUBSUB_SUBSCRIPTION_USES_TOPIC,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_pubsub_subscription_uses_topic' },
        },
      },
    });
  });
});
