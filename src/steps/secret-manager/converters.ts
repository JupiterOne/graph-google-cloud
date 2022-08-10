import { secretmanager_v1beta1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import {
  ENTITY_CLASS_SECRET_MANAGER_SECRET,
  ENTITY_CLASS_SECRET_MANAGER_SECRET_VERSION,
  ENTITY_TYPE_SECRET_MANAGER_SECRET,
  ENTITY_TYPE_SECRET_MANAGER_SECRET_VERSION,
} from './constants';

export function createSecretEntity(data: secretmanager_v1beta1.Schema$Secret) {
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

export function createSecretVersionEntity(
  data: secretmanager_v1beta1.Schema$SecretVersion,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: ENTITY_CLASS_SECRET_MANAGER_SECRET_VERSION,
        _type: ENTITY_TYPE_SECRET_MANAGER_SECRET_VERSION,
        _key: data.name as string,
        name: data.name,
      },
    },
  });
}
