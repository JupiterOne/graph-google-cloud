import {
  createDirectRelationship,
  IntegrationStep,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import {
  CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
  STEP_CLOUD_STORAGE_BUCKETS,
} from '../storage';
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

export async function fetchSinks(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new LoggingClient({ config });

  await client.iterateProjectSinks(async (projectSink) => {
    const projectSinkEntity = createLoggingProjectSinkEntity(
      projectSink,
      client.projectId,
    );
    await jobState.addEntity(projectSinkEntity);

    // If the logging sink is using bucket for destination we want to create relationship with it
    if (projectSink.destination?.includes('storage.googleapis.com')) {
      const bucketName = projectSink.destination?.split('/')[1];
      const bucketEntity = await jobState.findEntity(
        getCloudStorageBucketKey(bucketName),
      );

      if (bucketEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.USES,
            from: projectSinkEntity,
            to: bucketEntity,
          }),
        );
      }
    }
  });
}

export async function fetchMetrics(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new LoggingClient({ config });

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
              condition?.includes(metricEntity.name),
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

export const loggingSteps: IntegrationStep<IntegrationConfig>[] = [
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
    relationships: [
      {
        _class: RelationshipClass.USES,
        _type: RELATIONSHIP_TYPE_PROJECT_SINK_USES_STORAGE_BUCKET,
        sourceType: LOGGING_PROJECT_SINK_ENTITY_TYPE,
        targetType: CLOUD_STORAGE_BUCKET_ENTITY_TYPE,
      },
    ],
    dependsOn: [STEP_CLOUD_STORAGE_BUCKETS],
    executionHandler: fetchSinks,
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
  },
];
