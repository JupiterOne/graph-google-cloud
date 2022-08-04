import { secretmanager_v1beta1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_SECRET_MANAGER_SECRET,
  ENTITY_TYPE_SECRET_MANAGER_SECRET,
} from './constants';

export function createSecretEntitiy(data: secretmanager_v1beta1.Schema$Secret) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_SECRET_MANAGER_SECRET,
        _type: ENTITY_TYPE_SECRET_MANAGER_SECRET,
        _key: data.name as string,
        name: data.name,
      },
    },
  });
}
