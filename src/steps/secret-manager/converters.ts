import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core';
import { secretmanager_v1 } from 'googleapis';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';
import { SecretManagerEntities } from './constants';

export function createSecretEntity(data: secretmanager_v1.Schema$Secret) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: SecretManagerEntities.SECRET._class,
        _type: SecretManagerEntities.SECRET._type,
        _key: data.name as string,
        name: data.name,
        createdAt: parseTimePropertyValue(data.createTime),
        expiresAt: parseTimePropertyValue(data.expireTime),
        automaticReplicationKmsKeyName:
          data.replication?.automatic?.customerManagedEncryption?.kmsKeyName,
        nextRotationTime: parseTimePropertyValue(
          data.rotation?.nextRotationTime,
        ),
        rotationPeriod: data.rotation?.rotationPeriod,
        topicNames: data.topics?.map((t) => t.name!),
        ttl: data.ttl,
      },
    },
  });
}

export function createSecretVersionEntity(
  data: secretmanager_v1.Schema$SecretVersion,
) {
  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: SecretManagerEntities.SECRET_VERSION._class,
        _type: SecretManagerEntities.SECRET_VERSION._type,
        _key: data.name as string,
        name: data.name,
        createdAt: parseTimePropertyValue(data.createTime),
        destroyTime: parseTimePropertyValue(data.destroyTime),
      },
    },
  });
}
