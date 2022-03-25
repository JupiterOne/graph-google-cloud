import {
  Entity,
  IntegrationError,
  JobState,
} from '@jupiterone/integration-sdk-core';
import { ResourceManagerEntities } from '../steps/resource-manager/constants';

export async function getProjectEntity(jobState: JobState): Promise<Entity> {
  const projectEntity = await jobState.getData<Entity>(
    ResourceManagerEntities.PROJECT._type,
  );

  if (!projectEntity) {
    throw new IntegrationError({
      message: 'Could not find project entity in job state',
      code: 'PROJECT_ENTITY_NOT_FOUND',
      fatal: true,
    });
  }

  return projectEntity;
}
