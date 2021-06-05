import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { fetchAccessPolicies } from '.';
import { IntegrationConfig } from '../..';
import { integrationConfig } from '../../../test/config';
import { setupGoogleCloudRecording } from '../../../test/recording';
import { ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY } from './constants';

describe('#fetchAccessContextManagerAccessPolicies', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAccessContextManagerAccessPolicies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchAccessPolicies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['AccessPolicy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_access_context_manager_access_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          title: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });
  });
});

describe('#fetchAccessContextManagerAccessLevels', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchAccessContextManagerAccessPolicies',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchAccessPolicies(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === ENTITY_TYPE_ACCESS_CONTEXT_MANAGER_ACCESS_POLICY,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['AccessPolicy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_access_context_manager_access_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          title: { type: 'string' },
          etag: { type: 'string' },
        },
      },
    });
  });
});
