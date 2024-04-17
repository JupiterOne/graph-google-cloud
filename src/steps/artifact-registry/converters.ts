import { artifactregistry_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ARTIFACT_REGISTRY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_TYPE,
  ARTIFACT_REGISTRY_TYPE,
  ARTIFACT_REPOSITORY_PACKAGE_CLASS,
  ARTIFACT_REPOSITORY_PACKAGE_TYPE,
} from './constants';

export function createArtifactRegistryRepositoryEntity(
  data: artifactregistry_v1.Schema$Repository,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ARTIFACT_REGISTRY_REPOSITORY_TYPE,
        _class: ARTIFACT_REGISTRY_REPOSITORY_CLASS,
        name: data.name,
        createdTime: data.createTime,
        updatedTime: data.updateTime,
        format: data.format,
        mode: data.mode,
      },
    },
  });
}

export function createArtifactRepositoryPackageEntity(
  data: artifactregistry_v1.Schema$Package,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: data.name as string,
        _type: ARTIFACT_REPOSITORY_PACKAGE_TYPE,
        _class: ARTIFACT_REPOSITORY_PACKAGE_CLASS,
        name: data.name,
        createdTime: data.createTime,
      },
    },
  });
}

export function createArtifactRegistryEntity(
  organizationId: string,
  data: any,
  projectId: string,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _key: (organizationId + '_' + ARTIFACT_REGISTRY_TYPE) as string,
        _type: ARTIFACT_REGISTRY_TYPE,
        _class: ARTIFACT_REGISTRY_CLASS,
        name: 'Artifact Registry Service',
        function: ['container-registry'],
        category: ['software'],
        endpoint: 'http://console.cloud.google.com/',
      },
    },
  });
}
