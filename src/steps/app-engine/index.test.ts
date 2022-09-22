import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import {
  buildAppEngineApplicationUsesBucketRelationships,
  fetchAppEngineApplication,
  fetchAppEngineServices,
  fetchAppEngineServiceVersions,
  fetchAppEngineVersionInstances,
} from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import { fetchStorageBuckets } from '../storage';
import {
  ENTITY_TYPE_APP_ENGINE_APPLICATION,
  ENTITY_TYPE_APP_ENGINE_INSTANCE,
  ENTITY_TYPE_APP_ENGINE_SERVICE,
  ENTITY_TYPE_APP_ENGINE_VERSION,
  RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_HAS_SERVICE,
  RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_USES_BUCKET,
  RELATIONSHIP_TYPE_APP_ENGINE_SERVICE_HAS_VERSION,
  RELATIONSHIP_TYPE_APP_ENGINE_VERSION_HAS_INSTANCE,
  RELATIONSHIP_TYPE_GOOGLE_USER_CREATED_VERSION,
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

describe('#fetchAppEngineApplication', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAppEngineApplication',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchAppEngineApplication(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_APP_ENGINE_APPLICATION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Application'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_app_engine_application' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          location: { type: 'string' },
          servingStatus: { type: 'string' },
          defaultHostname: { type: 'string' },
          defaultBucket: { type: 'string' },
          codeBucket: { type: 'string' },
          authDomain: { type: 'string' },
          grcDomain: { type: 'string' },
          splitHealthChecks: { type: 'boolean' },
          useContainerOptimizedOs: { type: 'boolean' },
          webLink: { type: 'string' },
          hostname: { type: ['string', 'null'] },
        },
      },
    });
  });
});

describe('#buildAppEngineApplicationUsesBucketRelationships', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'buildAppEngineApplicationUsesBucketRelationships',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchStorageBuckets(context);
    await fetchAppEngineApplication(context);
    await buildAppEngineApplicationUsesBucketRelationships(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_USES_BUCKET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_app_engine_application_uses_storage_bucket' },
        },
      },
    });
  });
});

describe('#fetchAppEngineServices', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAppEngineServices',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchAppEngineApplication(context);
    await fetchAppEngineServices(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_APP_ENGINE_APPLICATION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Application'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_app_engine_application' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          location: { type: 'string' },
          servingStatus: { type: 'string' },
          defaultHostname: { type: 'string' },
          defaultBucket: { type: 'string' },
          codeBucket: { type: 'string' },
          authDomain: { type: 'string' },
          grcDomain: { type: 'string' },
          splitHealthChecks: { type: 'boolean' },
          useContainerOptimizedOs: { type: 'boolean' },
          webLink: { type: 'string' },
          hostname: { type: ['string', 'null'] },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_APP_ENGINE_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Container'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_app_engine_service' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_APP_ENGINE_APPLICATION_HAS_SERVICE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_app_engine_application_has_service' },
        },
      },
    });
  });
});

describe('#fetchAppEngineVersions', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAppEngineVersions',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: tempNewAccountConfig,
    });

    await fetchStorageBuckets(context);
    await fetchAppEngineApplication(context);
    await fetchAppEngineServices(context);
    await fetchAppEngineServiceVersions(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_APP_ENGINE_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Container'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_app_engine_service' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_APP_ENGINE_VERSION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_app_engine_version' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          versionUrl: { type: 'string' },
          threadsafe: { type: 'boolean' },
          env: { type: 'string' },
          runtime: { type: 'string' },
          servingStatus: { type: 'string' },
          createdBy: { type: 'string' },
          instanceClass: { type: 'string' },
          diskUsageBytes: { type: 'number' },
          manualScalingInstances: { type: 'number' },
          cpuCount: { type: 'number' },
          diskGb: { type: 'number' },
          memoryGb: { type: 'number' },
          readinessCheckFailureThreshold: { type: 'number' },
          readinessCheckSuccessThreshold: { type: 'number' },
          readinessCheckInterval: { type: 'string' },
          readinessCheckTimeout: { type: 'string' },
          readinessCheckAppStartTimeout: { type: 'string' },
          livenessCheckFailureThreshold: { type: 'number' },
          livenessCheckSuccessThreshold: { type: 'number' },
          livenessCheckInterval: { type: 'string' },
          livenessCheckTimeout: { type: 'string' },
          livenessCheckInitialDelay: { type: 'string' },
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_APP_ENGINE_SERVICE_HAS_VERSION,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_app_engine_service_has_version' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_GOOGLE_USER_CREATED_VERSION,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        additionalProperties: true,
        properties: {
          _class: { const: 'CREATED' },
          _type: { const: 'mapping_source_created_google_user' },
        },
      },
    });
  });
});

describe('#fetchAppEngineInstances', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAppEngineInstances',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchAppEngineApplication(context);
    await fetchAppEngineServices(context);
    await fetchAppEngineServiceVersions(context);
    await fetchAppEngineVersionInstances(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_APP_ENGINE_VERSION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_app_engine_version' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          versionUrl: { type: 'string' },
          threadsafe: { type: 'boolean' },
          env: { type: 'string' },
          runtime: { type: 'string' },
          servingStatus: { type: 'string' },
          createdBy: { type: 'string' },
          instanceClass: { type: 'string' },
          diskUsageBytes: { type: 'number' },
          manualScalingInstances: { type: 'number' },
          cpuCount: { type: 'number' },
          diskGb: { type: 'number' },
          memoryGb: { type: 'number' },
          readinessCheckFailureThreshold: { type: 'number' },
          readinessCheckSuccessThreshold: { type: 'number' },
          readinessCheckInterval: { type: 'string' },
          readinessCheckTimeout: { type: 'string' },
          readinessCheckAppStartTimeout: { type: 'string' },
          livenessCheckFailureThreshold: { type: 'number' },
          livenessCheckSuccessThreshold: { type: 'number' },
          livenessCheckInterval: { type: 'string' },
          livenessCheckTimeout: { type: 'string' },
          livenessCheckInitialDelay: { type: 'string' },
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_APP_ENGINE_INSTANCE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Host'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_app_engine_instance' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          appEngineRelease: { type: 'string' },
          availability: { type: 'string' },
          requests: { type: 'number' },
          averageLatency: { type: 'number' },
          memoryUsage: { type: 'number' },
          vmStatus: { type: 'string' },
          vmIp: { type: 'string' },
          vmLiveness: { type: 'string' },
          createdOn: { type: 'number' },
          hostname: { type: ['string', 'null'] },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_APP_ENGINE_VERSION_HAS_INSTANCE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_app_engine_version_has_instance' },
        },
      },
    });
  });
});
