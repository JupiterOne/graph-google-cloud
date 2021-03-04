import {
  Entity,
  IntegrationError,
  JobState,
} from '@jupiterone/integration-sdk-core';
import { PROJECT_ENTITY_TYPE } from '../steps/resource-manager';

export async function getProjectEntity(jobState: JobState): Promise<Entity> {
  const projectEntity = await jobState.getData<Entity>(PROJECT_ENTITY_TYPE);

  if (!projectEntity) {
    throw new IntegrationError({
      message: 'Could not find project entity in job state',
      code: 'PROJECT_ENTITY_NOT_FOUND',
      fatal: true,
    });
  }

  return projectEntity;
}
