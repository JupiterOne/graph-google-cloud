import { cloudbuild_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../../utils/entity';
import { CloudBuildEntitiesSpec } from '../constants';

export default (source: cloudbuild_v1.Schema$BuildTrigger) => {
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
