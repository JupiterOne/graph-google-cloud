import { artifactregistry_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ARTIFACT_REGISTRY_REPOSITORY_CLASS,
  ARTIFACT_REGISTRY_REPOSITORY_TYPE,
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
      },
    },
  });
}
