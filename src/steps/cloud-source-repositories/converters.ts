import { sourcerepo_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { CloudSourceRepositoriesEntitiesSpec } from './constants';

export const createRepositoryEntity = (source: sourcerepo_v1.Schema$Repo) => {
  return createGoogleCloudIntegrationEntity(source, {
    entityData: {
      source: source,
      assign: {
        _class: CloudSourceRepositoriesEntitiesSpec.REPOSITORY._class,
        _type: CloudSourceRepositoriesEntitiesSpec.REPOSITORY._type,
        _key: source.name as string,
        name: source.name,
        size: source.size,
        url: source.url,
        'mirrorConfig.deployKeyId': source.mirrorConfig?.deployKeyId,
        'mirrorConfig.url': source.mirrorConfig?.url,
        'mirrorConfig.webhookId': source.mirrorConfig?.webhookId,
      },
    },
  });
};
