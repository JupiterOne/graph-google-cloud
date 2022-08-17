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
      },
    },
  });
}
