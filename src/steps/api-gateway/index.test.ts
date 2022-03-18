import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';
import {
  fetchApiGatewayApiConfigs,
  fetchApiGatewayApis,
  fetchApiGatewayGateways,
} from '.';
import {
  ENTITY_TYPE_API_GATEWAY_API,
  ENTITY_TYPE_API_GATEWAY_API_CONFIG,
  ENTITY_TYPE_API_GATEWAY_GATEWAY,
  RELATIONSHIP_TYPE_API_GATEWAY_API_CONFIG_USES_SERVICE_ACCOUNT,
  RELATIONSHIP_TYPE_API_GATEWAY_API_HAS_GATEWAY,
  RELATIONSHIP_TYPE_API_GATEWAY_API_USES_CONFIG,
} from './constants';
import { fetchIamServiceAccounts } from '../iam';

describe('#fetchApiGatewayApis', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchApiGatewayApis',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchApiGatewayApis(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_API_GATEWAY_API,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_api_gateway_api' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          state: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          managedService: { type: 'string' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });
  });
});

describe('#fetchApiGatewayApiConfigs', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchApiGatewayApiConfigs',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchIamServiceAccounts(context);
    await fetchApiGatewayApis(context);
    await fetchApiGatewayApiConfigs(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_API_GATEWAY_API,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_api_gateway_api' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          state: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          managedService: { type: 'string' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_API_GATEWAY_API_CONFIG,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_api_gateway_api_config' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },

          name: { type: 'string' },
          displayName: { type: 'string' },
          state: { type: 'string' },
          public: { type: 'boolean' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_API_GATEWAY_API_USES_CONFIG,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_api_gateway_api_uses_config' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) =>
          e._type ===
          RELATIONSHIP_TYPE_API_GATEWAY_API_CONFIG_USES_SERVICE_ACCOUNT,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: {
            const: 'google_api_gateway_api_config_uses_iam_service_account',
          },
        },
      },
    });
  });
});

describe('#fetchApiGatewayGateways', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchApiGatewayGateways',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchApiGatewayApis(context);
    await fetchApiGatewayGateways(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_API_GATEWAY_API,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Service'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_api_gateway_api' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          state: { type: 'string' },
          category: {
            type: 'array',
            items: { type: 'string' },
          },
          public: { type: 'boolean' },
          managedService: { type: 'string' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_API_GATEWAY_GATEWAY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Gateway'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_api_gateway_gateway' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          defaultHostname: { type: 'string' },
          state: { type: 'string' },
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
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_API_GATEWAY_API_HAS_GATEWAY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_api_gateway_api_has_gateway' },
        },
      },
    });
  });
});
