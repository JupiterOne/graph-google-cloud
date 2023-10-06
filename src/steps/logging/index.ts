import {
  createDirectRelationship,
  getRawData,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { LoggingClient } from './client';
import {
  LOGGING_METRIC_ENTITY_CLASS,
  LOGGING_METRIC_ENTITY_TYPE,
  LOGGING_PROJECT_SINK_ENTITY_CLASS,
  LOGGING_PROJECT_SINK_ENTITY_TYPE,
  STEP_LOGGING_METRICS,
  STEP_LOGGING_PROJECT_SINKS,
  RELATIONSHIP_TYPE_PROJECT_SINK_USES_STORAGE_BUCKET,
  RELATIONSHIP_TYPE_METRIC_HAS_ALERT_POLICY,
  STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS,
} from './constants';
import {
  createLoggingProjectSinkEntity,
  createMetricEntity,
} from './converters';
import { getCloudStorageBucketKey } from '../storage/converters';
import {
  MONITORING_ALERT_POLICY_TYPE,
  STEP_MONITORING_ALERT_POLICIES,
} from '../monitoring/constants';
import { logging_v2 } from 'googleapis';
import { StorageEntitiesSpec, StorageStepsSpec } from '../storage/constants';

export async function fetchSinks(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new LoggingClient({ config }, logger);

  await client.iterateProjectSinks(async (projectSink) => {
    const projectSinkEntity = createLoggingProjectSinkEntity(
      projectSink,
      client.projectId,
    );
    await jobState.addEntity(projectSinkEntity);
  });
}

export async function buildSinkUsesBucketRelationships(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: LOGGING_PROJECT_SINK_ENTITY_TYPE },
    async (projectSinkEntity) => {
      const instance = getRawData<logging_v2.Schema$LogSink>(projectSinkEntity);
      if (!instance) {
        logger.warn(
          {
            _key: projectSinkEntity._key,
          },
          'Could not find raw data on logging project sink entity',
        );
        return;
      }

      const destination = instance.destination;
      if (!destination) {
        return;
      }

      if (!destination.includes('storage.googleapis.com')) {
        return;
      }

      const bucketName = destination.split('/')[1];
      if (!bucketName) {
        return;
      }

      const bucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(bucketName),
      );
      if (!bucketEntity) {
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.USES,
          from: projectSinkEntity,
          to: bucketEntity,
        }),
      );
    },
  );
}

export async function fetchMetrics(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
    logger,
  } = context;

  const client = new LoggingClient({ config }, logger);

  await client.iterateMetrics(async (metric) => {
    const metricEntity = createMetricEntity(metric, client.projectId);
    await jobState.addEntity(metricEntity);

    await jobState.iterateEntities(
      {
        _type: MONITORING_ALERT_POLICY_TYPE,
      },
      async (alertPolicyEntity) => {
        if (alertPolicyEntity) {
          // Check if alertPolicy exists for this particular metric
          if (
            (alertPolicyEntity.conditionFilters as string[]).find((condition) =>
              condition?.includes(metricEntity.name as string),
            )
          ) {
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                from: metricEntity,
                to: alertPolicyEntity,
              }),
            );
          }
        }
      },
    );
  });
}

export const loggingSteps: GoogleCloudIntegrationStep[] = [
  {
    id: STEP_LOGGING_PROJECT_SINKS,
    name: 'Logging Project Sinks',
    entities: [
      {
        resourceName: 'Logging Project Sink',
        _type: LOGGING_PROJECT_SINK_ENTITY_TYPE,
        _class: LOGGING_PROJECT_SINK_ENTITY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchSinks,
    permissions: ['logging.sinks.list'],
    apis: ['logging.googleapis.com'],
  },
  {
    id: STEP_CREATE_LOGGING_PROJECT_SINK_BUCKET_RELATIONSHIPS,
    name: 'Build Logging Project Sink Bucket Relationships',
    entities: [],
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_PROJECT_SINK_USES_STORAGE_BUCKET,
        sourceType: LOGGING_PROJECT_SINK_ENTITY_TYPE,
        targetType: StorageEntitiesSpec.STORAGE_BUCKET._type,
      },
    ],
    dependsOn: [
      STEP_LOGGING_PROJECT_SINKS,
      StorageStepsSpec.FETCH_STORAGE_BUCKETS.id,
    ],
    executionHandler: buildSinkUsesBucketRelationships,
  },
  {
    id: STEP_LOGGING_METRICS,
    name: 'Logging Metrics',
    entities: [
      {
        resourceName: 'Logging Metric',
        _type: LOGGING_METRIC_ENTITY_TYPE,
        _class: LOGGING_METRIC_ENTITY_CLASS,
      },
    ],
    relationships: [
      {
        _class: RelationshipClass.HAS,
        _type: RELATIONSHIP_TYPE_METRIC_HAS_ALERT_POLICY,
        sourceType: LOGGING_METRIC_ENTITY_TYPE,
        targetType: MONITORING_ALERT_POLICY_TYPE,
      },
    ],
    dependsOn: [STEP_MONITORING_ALERT_POLICIES],
    executionHandler: fetchMetrics,
    permissions: ['logging.logMetrics.list'],
    apis: ['logging.googleapis.com'],
  },
];
