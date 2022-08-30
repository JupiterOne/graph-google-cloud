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
        _class: CloudBuildEntitiesSpec.BUILD_TRIGGER._class,
        _type: CloudBuildEntitiesSpec.BUILD_TRIGGER._type,
        _key: data.id as string,
        name: data.name,
        id: data.id as string,
        createdOn: parseTimePropertyValue(source.createTime),
      },
    },
  });
};

export const createGoogleCloudBuildWorkerPoolEntity = (
  data: cloudbuild_v1.Schema$WorkerPool,
) => {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: CloudBuildEntitiesSpec.BUILD_WORKER_POOL._class,
        _type: CloudBuildEntitiesSpec.BUILD_WORKER_POOL._type,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        createdOn: parseTimePropertyValue(data.createTime),
        updatedOn: parseTimePropertyValue(data.updateTime),
        deletedOn: parseTimePropertyValue(data.deleteTime),
      },
    },
  });
};

export const createGoogleCloudBuildGithubEnterpriseConfigEntity = (
  data: cloudbuild_v1.Schema$GitHubEnterpriseConfig,
) => {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: CloudBuildEntitiesSpec.BUILD_GITHUB_ENTERPRISE_CONFIG._class,
        _type: CloudBuildEntitiesSpec.BUILD_GITHUB_ENTERPRISE_CONFIG._type,
        _key: data.name as string,
        name: data.name,
        displayName: data.displayName as string,
        appId: data.appId,
        createdOn: parseTimePropertyValue(data.createTime),
        hostUrl: data.hostUrl,
        peeredNetwork: data.peeredNetwork,
        'secrets.oauthClientIdVersionName':
          data.secrets?.oauthClientIdVersionName,
        'secrets.oauthSecretVersionName': data.secrets?.oauthSecretVersionName,
        'secrets.privateKeyVersionName': data.secrets?.privateKeyVersionName,
        'secrets.webhookSecretVersionName':
          data.secrets?.webhookSecretVersionName,
        sslCa: data.sslCa,
        webhookKey: data.webhookKey,
      },
    },
  });
};