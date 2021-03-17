import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { logging_v2 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { getGoogleCloudConsoleWebLink } from '../../utils/url';
import {
  LOGGING_METRIC_ENTITY_CLASS,
  LOGGING_METRIC_ENTITY_TYPE,
  LOGGING_PROJECT_SINK_ENTITY_CLASS,
  LOGGING_PROJECT_SINK_ENTITY_TYPE,
} from './constants';

export function getLogingProjectSinkId(name: string) {
  return `google_logging_log_sink:${name}`;
}

export function createLoggingProjectSinkEntity(
  data: logging_v2.Schema$LogSink,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: getLogingProjectSinkId(data.name as string),
        _type: LOGGING_PROJECT_SINK_ENTITY_TYPE,
        _class: LOGGING_PROJECT_SINK_ENTITY_CLASS,
        name: data.name,
        displayName: data.name as string,
        // 2.2 Ensure that sinks are configured for all log entries (Scored)
        destination: data.destination,
        filter: data.filter,
        webLink: getGoogleCloudConsoleWebLink(
          `/logs/router?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}

export function createMetricEntity(
  data: logging_v2.Schema$LogMetric,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: LOGGING_METRIC_ENTITY_TYPE,
        _class: LOGGING_METRIC_ENTITY_CLASS,
        name: data.name,
        displayName: data.name as string,
        filter: data.filter?.replace(/\n/g, ' '),
        webLink: getGoogleCloudConsoleWebLink(
          `/logs/metrics?project=${projectId}`,
        ),
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
      },
    },
  });
}
