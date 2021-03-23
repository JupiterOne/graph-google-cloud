import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import {
  fetchCloudRunConfigurations,
  fetchCloudRunRoutes,
  fetchCloudRunServices,
} from '.';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
  ENTITY_TYPE_CLOUD_RUN_ROUTE,
  ENTITY_TYPE_CLOUD_RUN_SERVICE,
  RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_CONFIGURATION,
  RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_ROUTE,
} from './constants';

describe('#fetchCloudRunServices', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCloudRunServices',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchCloudRunServices(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_CLOUD_RUN_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_run_service' },
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
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchCloudRunRoutes', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCloudRunRoutes',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchCloudRunServices(context);
    await fetchCloudRunRoutes(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_CLOUD_RUN_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_run_service' },
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
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_CLOUD_RUN_ROUTE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_run_route' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          url: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_ROUTE,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'MANAGES' },
          _type: { const: 'google_cloud_run_service_manages_route' },
        },
      },
    });
  });
});

describe('#fetchCloudRunConfigurations', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchCloudRunConfigurations',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchCloudRunServices(context);
    await fetchCloudRunConfigurations(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_CLOUD_RUN_SERVICE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_cloud_run_service' },
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
          createdOn: { type: 'number' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_CLOUD_RUN_CONFIGURATION,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'google_cloud_run_configuration' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          apiVersion: { type: 'string' },
          createdOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type === RELATIONSHIP_TYPE_CLOUD_RUN_SERVICE_MANAGES_CONFIGURATION,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'MANAGES' },
          _type: { const: 'google_cloud_run_service_manages_configuration' },
        },
      },
    });
  });
});
