import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { cloudbuild_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { CloudBuildEntities } from './constants';

export function createBuildEntity(source: cloudbuild_v1.Schema$Build) {
  const data = {
    ...source,
    labels: source.tags,
    tags: undefined,
  };

  return createGoogleCloudIntegrationEntity(source, {
    entityData: {
      source: source,
      assign: {
        _class: CloudBuildEntities.BUILD._class,
        _type: CloudBuildEntities.BUILD._type,
        _key: data.name as string,
        name: data.name,
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
}
