import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchSinks, fetchMetrics } from '.';
import { fetchAlertPolicies } from '../monitoring';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  fetchStorageBuckets,
} from '../storage';
import { integrationConfig } from '../../../test/config';
import { Recording, setupGoogleCloudRecording } from '../../../test/recording';
import { IntegrationConfig } from '../../types';

import {
  LOGGING_METRIC_ENTITY_TYPE,
  LOGGING_PROJECT_SINK_ENTITY_TYPE,
  RELATIONSHIP_TYPE_METRIC_HAS_ALERT_POLICY,
  RELATIONSHIP_TYPE_PROJECT_SINK_USES_STORAGE_BUCKET,
} from './constants';
import { MONITORING_ALERT_POLICY_TYPE } from '../monitoring/constants';

describe('#fetchProjectSinks', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchProjectSinks',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchStorageBuckets(context);
    await fetchSinks(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['DataStore'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_storage_bucket' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          storageClass: { type: 'string' },
          encrypted: { const: true },
          encryptionKeyRef: { type: 'string' },
          kmsKeyName: { type: 'string' },
          uniformBucketLevelAccess: { type: 'boolean' },
          retentionPolicyEnabled: { type: 'boolean' },
          retentionPeriod: { type: 'string' },
          retentionDate: { type: 'string' },
          public: { type: 'boolean' },
          accessLevel: { type: 'string' },
          accessLevelIsConditional: { type: 'boolean' },
          accessLevelCondition: { type: 'string' },
          classification: { const: null },
          etag: { type: 'string' },
          webLink: { type: 'string' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === LOGGING_PROJECT_SINK_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Logs'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_logging_project_sink' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          destination: { type: 'string' },
          filter: { type: 'string' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_PROJECT_SINK_USES_STORAGE_BUCKET,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'USES' },
          _type: { const: 'google_logging_project_sink_uses_storage_bucket' },
        },
      },
    });
  });
});

describe('#fetchMetrics', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'fetchMetrics',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await fetchAlertPolicies(context);
    await fetchMetrics(context);

    expect({
      numCollectedEntities: context.jobState.collectedEntities.length,
      numCollectedRelationships: context.jobState.collectedRelationships.length,
      collectedEntities: context.jobState.collectedEntities,
      collectedRelationships: context.jobState.collectedRelationships,
      encounteredTypes: context.jobState.encounteredTypes,
    }).toMatchSnapshot();

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === MONITORING_ALERT_POLICY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Policy'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_monitoring_alert_policy' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          content: { type: 'string' },
          conditionFilters: {
            type: 'array',
            items: { type: 'string' },
          },
          enabled: { type: 'boolean' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedEntities.filter(
        (e) => e._type === LOGGING_METRIC_ENTITY_TYPE,
      ),
    ).toMatchGraphObjectSchema({
      _class: ['Configuration'],
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'google_logging_metric' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          name: { type: 'string' },
          displayName: { type: 'string' },
          filter: { type: 'string' },
          webLink: { type: 'string' },
          createdOn: { type: 'number' },
          updatedOn: { type: 'number' },
        },
      },
    });

    expect(
      context.jobState.collectedRelationships.filter(
        (e) => e._type === RELATIONSHIP_TYPE_METRIC_HAS_ALERT_POLICY,
      ),
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _class: { const: 'HAS' },
          _type: { const: 'google_logging_metric_has_monitoring_alert_policy' },
        },
      },
    });
  });
});
