import { cloudscheduler_v1 } from 'googleapis';
import { Entities } from './constants';
import { createGoogleCloudIntegrationEntity } from '../../utils/entity';

export function createCloudSchedulerEntity(data: cloudscheduler_v1.Schema$Job) {
  const name = data.name!;

  return createGoogleCloudIntegrationEntity(data, {
    entityData: {
      source: data,
      assign: {
        _class: Entities.CLOUD_SCHEDULER_JOB._class,
        _type: Entities.CLOUD_SCHEDULER_JOB._type,
        _key: name,
        name,
        displayName: name,
        state: data.state,
        enabled: data.state === 'ENABLED',
      },
    },
  });
}
