import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  buildMemcacheInstancesUsesNetworkRelationships,
  fetchMemcacheInstances,
} from '.';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchComputeNetworks } from '../compute';
import {
  ENTITY_TYPE_MEMCACHE_INSTANCE,
  ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
  RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_HAS_NODE,
  RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_USES_NETWORK,
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

describe('#fetchMemcacheInstances', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchMemcacheInstances',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchMemcacheInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_MEMCACHE_INSTANCE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database', 'DataStore', 'Cluster'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_memcache_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          nodeCount: { type: 'number' },
          nodeCpuCount: { type: 'number' },
          nodeMemorySizeMb: { type: 'number' },
          memcacheVersion: { type: 'string' },
          memcacheFullVersion: { type: 'string' },
          state: { type: 'string' },
          discoveryEndpoint: { type: 'string' },
          encrypted: { const: null },
          classification: { const: null },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
          webLink: { type: 'string' },
          hostname: { type: ['string', 'null'] },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_MEMCACHE_INSTANCE_NODE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database', 'DataStore', 'Host'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_memcache_instance_node' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },

          zone: { type: 'string' },
          state: { type: 'string' },
          host: { type: 'string' },
          port: { type: 'number' },
          classification: { const: null },
          encrypted: { const: null },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_HAS_NODE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_memcache_instance_has_node' },
        },
      },
    });
  });
});

describe('#buildMemcacheInstancesUsesNetworkRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildMemcacheInstancesUsesNetworkRelationships',
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
    await fetchMemcacheInstances(context);
    await buildMemcacheInstancesUsesNetworkRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_MEMCACHE_INSTANCE_USES_NETWORK,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_memcache_instance_uses_compute_network' },
        },
      },
    });
  });
});
