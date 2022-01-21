import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { CloudSchedulerClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { Steps, Entities } from './constants';
import { createCloudSchedulerEntity } from './converters';

export async function fetchSchedulerJobs(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, instance } = context;
  const client = new CloudSchedulerClient({ config: instance.config });

  await client.iterateCloudSchedulerJobs(async (schedulerJob) => {
    await jobState.addEntity(createCloudSchedulerEntity(schedulerJob));
  });
}

export const cloudSchedulerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.CLOUD_SCHEDULER_JOBS,
    name: 'Cloud Scheduler Jobs',
    entities: [Entities.CLOUD_SCHEDULER_JOB],
    relationships: [],
    executionHandler: fetchSchedulerJobs,
  },
];
