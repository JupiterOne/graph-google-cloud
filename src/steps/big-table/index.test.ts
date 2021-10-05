import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  fetchAppProfiles,
  fetchBackups,
  fetchClusters,
  fetchInstances,
  fetchTables,
} from '.';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
  ENTITY_TYPE_BIG_TABLE_BACKUP,
  ENTITY_TYPE_BIG_TABLE_CLUSTER,
  ENTITY_TYPE_BIG_TABLE_INSTANCE,
  ENTITY_TYPE_BIG_TABLE_TABLE,
  RELATIONSHIP_TYPE_CLUSTER_HAS_BACKUP,
  RELATIONSHIP_TYPE_CLUSTER_USES_KMS_KEY,
  RELATIONSHIP_TYPE_INSTANCE_HAS_APP_PROFILE,
  RELATIONSHIP_TYPE_INSTANCE_HAS_CLUSTER,
  RELATIONSHIP_TYPE_INSTANCE_HAS_TABLE,
  RELATIONSHIP_TYPE_TABLE_HAS_BACKUP,
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

describe('#fetchInstances', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchInstances',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.type === ENTITY_TYPE_BIG_TABLE_INSTANCE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Database'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigtable_instance' },
          name: { type: 'string' },
          state: { type: 'string' },
          type: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchAppProfiles', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAppProfiles',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchInstances(context);
    await fetchAppProfiles(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.type === ENTITY_TYPE_BIG_TABLE_APP_PROFILE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigtable_app_profile' },
          name: { type: 'string' },
          instanceId: { type: 'string' },
          etag: { type: 'string' },
          description: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_INSTANCE_HAS_APP_PROFILE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_bigtable_instance_has_app_profile',
          },
        },
      },
    });
  });
});

describe('#fetchClusters', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchClusters',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchInstances(context);
    await fetchClusters(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.type === ENTITY_TYPE_BIG_TABLE_CLUSTER,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Cluster'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigtable_cluster' },
          name: { type: 'string' },
          instanceId: { type: 'string' },
          state: { type: 'string' },
          location: { type: 'string' },
          defaultStorageType: { type: 'string' },
          serveNodes: { type: 'number' },
          kmsKeyName: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_INSTANCE_HAS_CLUSTER,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_bigtable_instance_has_cluster',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_CLUSTER_USES_KMS_KEY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_bigtable_cluster_uses_kms_key',
          },
        },
      },
    });
  });
});

describe('#fetchBackups', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchBackups',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchInstances(context);
    await fetchClusters(context);
    await fetchBackups(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.type === ENTITY_TYPE_BIG_TABLE_BACKUP,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Backup'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigtable_backup' },
          name: { type: 'string' },
          instanceId: { type: 'string' },
          clusterId: { type: 'string' },
          sourceTable: { type: 'string' },
          expireTime: { type: 'string' },
          startTime: { type: 'string' },
          endTime: { type: 'string' },
          sizeBytes: { type: 'string' },
          state: { type: 'string' },
          encryptionType: { type: 'string' },
          kmsKeyVersion: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_CLUSTER_HAS_BACKUP,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_bigtable_cluster_has_backup',
          },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_TABLE_HAS_BACKUP,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_bigtable_table_has_backup',
          },
        },
      },
    });
  });
});

describe('#fetchTables', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchTables',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchInstances(context);
    await fetchTables(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e.type === ENTITY_TYPE_BIG_TABLE_TABLE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataCollection'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_bigtable_table' },
          name: { type: 'string' },
          instanceId: { type: 'string' },
          granularity: { type: 'string' },
          backup: { type: 'string' },
          webLink: { type: 'string' },
          classification: { const: 'null' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_INSTANCE_HAS_TABLE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: {
            const: 'google_bigtable_instance_has_table',
          },
        },
      },
    });
  });
});
