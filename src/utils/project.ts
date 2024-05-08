import { Entity, JobState } from '@jupiterone/integration-sdk-core';
import { PROJECT_ENTITY_TYPE } from '../steps/resource-manager';

export async function getProjectEntity(
  jobState: JobState,
): Promise<Entity | undefined> {
  return jobState.getData<Entity>(PROJECT_ENTITY_TYPE);
}
