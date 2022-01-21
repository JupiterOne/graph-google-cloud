import { StepEntityMetadata } from '@jupiterone/integration-sdk-core';

export const Steps = {
  CLOUD_SCHEDULER_JOBS: 'fetch-cloud-scheduler-jobs',
};

export const Entities: Record<'CLOUD_SCHEDULER_JOB', StepEntityMetadata> = {
  CLOUD_SCHEDULER_JOB: {
    _type: 'google_cloud_scheduler_job',
    _class: ['Configuration'],
    resourceName: 'Cloud Scheduler Job',
  },
};
