import { JobState } from '@jupiterone/integration-sdk-core';
import { cloudresourcemanager_v3 } from 'googleapis';

export async function cacheProjectNameToId(
  jobState: JobState,
  project: cloudresourcemanager_v3.Schema$Project,
) {
  await jobState.setData(`project:${project.name}`, project.projectId);
}

export async function getProjectIdFromName(
  jobState: JobState,
  projectName: string,
) {
  return jobState.getData<string>(`project:${projectName}`);
}
