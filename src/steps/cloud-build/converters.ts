import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { CloudBuildEntitiesSpec } from './constants';

export const createGoogleCloudBuildEntity = (
  source: cloudbuild_v1.Schema$Build,
) => {
  const data = {
    ...source,
    labels: source.tags,
    tags: undefined,
  };

  return createGoogleCloudIntegrationEntity(source, {
    entityData: {
      source: source,
      assign: {
        _class: CloudBuildEntitiesSpec.BUILD._class,
        _type: CloudBuildEntitiesSpec.BUILD._type,
        _key: data.id as string,
        name: data.id as string,
        id: data.id as string,
        status: data.status,
        'source.storageSource.bucket': data.source?.storageSource?.bucket,
        'source.storageSource.object': data.source?.storageSource?.object,
        'source.storageSource.generation':
          data.source?.storageSource?.generation,
        'results.buildStepImages': data.results?.buildStepImages,
        'results.buildStepOutputs': data.results?.buildStepOutputs,
        createTime: parseTimePropertyValue(data.createTime),
        startTime: parseTimePropertyValue(data.startTime),
        finishTime: parseTimePropertyValue(data.finishTime),
        timeout: data.timeout,
        projectId: data.projectId,
        logsBucket: data.logsBucket,
        'options.logging': data.options?.logging,
        'options.pool': data.options?.workerPool,
        logUrl: data.logUrl,
        queueTtl: data.queueTtl,
      },
    },
  });
};

export const createGoogleCloudBuildTriggerEntity = (
  source: cloudbuild_v1.Schema$BuildTrigger,
) => {
  const data = {
    ...source,
    labels: source.tags,
    tags: undefined,
  };

  return createGoogleCloudIntegrationEntity(source, {
    entityData: {
      source: source,
      assign: {
        _class: CloudBuildEntitiesSpec.TRIGGER._class,
        _type: CloudBuildEntitiesSpec.TRIGGER._type,
        _key: data.id as string,
        name: data.name,
        id: data.id as string,
      },
    },
  });
};
