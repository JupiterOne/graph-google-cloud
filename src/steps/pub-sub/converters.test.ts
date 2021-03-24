import {
  createPubSubSubscriptionEntity,
  createPubSubTopicEntity,
} from './converters';
import { DEFAULT_INTEGRATION_CONFIG_PROJECT_ID } from '../../../test/config';
import {
  getMockPubSubSubscription,
  getMockPubSubTopic,
} from '../../../test/mocks';

describe('#createPubSubProjectTopicEntity', () => {
  test('should convert to entity', () => {
    expect(
      createPubSubTopicEntity({
        data: getMockPubSubTopic(),
        projectId: DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
        isPublic: false,
      }),
    ).toMatchSnapshot();
  });
});

describe('#createPubSubProjectSubscriptionEntity', () => {
  test('should convert to entity', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have deadLetter set to false if it is not using dead letter', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have deadLetter set to true if it is using dead letter', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription({
          deadLetterPolicy: {
            deadLetterTopic:
              'projects/j1-gc-integration-dev-v2/topics/mock-topic-dead-letter',
            maxDeliveryAttempts: 10,
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have enableMessageOrdering set to false if it is not enabled', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have enableMessageOrdering set to true if it is enabled', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription({
          enableMessageOrdering: true,
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have pushEndpoint value if the subscription is using push', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription({
          pushConfig: {
            pushEndpoint: 'https://j1-gc-integration-dev-v2.uc.r.appspot.com/',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have isDefaultRetryPolicy set to true if the subscription is using the default retry policy', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription(),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });

  test('should have isDefaultRetryPolicy set to false as well as minimumBackoff and maximumBackoff properties if the subscription is not using the default retry policy', () => {
    expect(
      createPubSubSubscriptionEntity(
        getMockPubSubSubscription({
          retryPolicy: {
            minimumBackoff: '10s',
            maximumBackoff: '600s',
          },
        }),
        DEFAULT_INTEGRATION_CONFIG_PROJECT_ID,
      ),
    ).toMatchSnapshot();
  });
});
