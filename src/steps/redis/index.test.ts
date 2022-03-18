import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import {
  buildRedisInstanceUsesNetworkRelationships,
  fetchRedisInstances,
} from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchComputeNetworks } from '../compute';
import {
  ENTITY_TYPE_REDIS_INSTANCE,
  RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK,
} from './constants';

const tempNewAccountConfig = {
  ...integrationConfig,
  serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
    'j1-gc-integration-dev-v2',
    'j1-gc-integration-dev-v3',
  ),
  serviceAccountKeyConfig: {
    ...integrationConfig.serviceAccountKeyConfig,
    project_id: 'j1-gc-integration-dev-v3',
  },
};

describe('#fetchRedisInstances', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchRedisInstances',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchRedisInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_REDIS_INSTANCE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database', 'DataStore', 'Host'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_redis_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          redisVersion: { type: 'string' },
          hostname: { type: 'string' },
          port: { type: 'number' },
          reservedIpRange: { type: 'string' },
          state: { type: 'string' },
          tier: { type: 'string' },
          memorySizeGb: { type: 'number' },
          connectMode: { type: 'string' },
          transitEncryptionModeEnabled: { type: 'boolean' },
          statusMessage: { type: 'string' },
          encrypted: { const: null },
          classification: { const: null },
          authEnabled: { type: 'boolean' },
          alternativeLocationId: { type: 'string' },
          currentLocationId: { type: 'string' },
          locationId: { type: 'string' },
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_redis_instance_uses_compute_network' },
        },
      },
    });
  });
});

describe('#buildRedisInstanceUsesNetworkRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildRedisInstanceUsesNetworkRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchComputeNetworks(context);
    await fetchRedisInstances(context);
    await buildRedisInstanceUsesNetworkRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_REDIS_INSTANCE_USES_NETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_redis_instance_uses_compute_network' },
        },
      },
    });
  });
});
