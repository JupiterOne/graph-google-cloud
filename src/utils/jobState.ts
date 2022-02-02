import { JobState } from '@jupiterone/integration-sdk-core';
import { cloudresourcemanager_v3, compute_v1, run_v1 } from 'googleapis';
import { getCloudRunServiceKey } from '../steps/cloud-run/converters';

export const PEERED_NETWORKS = 'network:all_peerings';

export async function cacheProjectNameAndId(
  jobState: JobState,
  project: cloudresourcemanager_v3.Schema$Project,
) {
  await jobState.setData(`projectName:${project.name}`, project.projectId);
  await jobState.setData(`projectId:${project.projectId}`, project.name);
}

export async function getProjectIdFromName(
  jobState: JobState,
  projectName: string,
) {
  return jobState.getData<string>(`projectName:${projectName}`);
}

export async function getProjectNameFromId(
  jobState: JobState,
  projectId: string,
) {
  return jobState.getData<string>(`projectId:${projectId}`);
}

export async function cacheCloudRunServiceKeyAndUid(
  jobState,
  cloudRunService: run_v1.Schema$Service,
  projectId: string,
): Promise<string> {
  const location = cloudRunService.metadata?.labels
    ? cloudRunService.metadata?.labels['cloud.googleapis.com/location']
    : '';
  const name = cloudRunService.metadata?.name;

  const uid = cloudRunService.metadata?.uid;
  const key = getCloudRunServiceKey(projectId, location, name as string);

  await jobState.setData(`cloudRunServiceUid:${uid}`, key);

  return key;
}

export async function getCloudRunServiceKeyFromUid(
  jobState: JobState,
  uid: string,
) {
  return jobState.getData<string>(`cloudRunServiceUid:${uid}`);
}

export async function getPeeredNetworks(jobState: JobState) {
  return jobState.getData<string[]>(PEERED_NETWORKS);
}

export async function setPeeredNetworks(
  jobState: JobState,
  networks: string[],
) {
  await jobState.setData<string[]>(PEERED_NETWORKS, networks);
}

export async function setNetworkPeerings(
  jobState: JobState,
  networkSelfLink: string,
  peerings: compute_v1.Schema$NetworkPeering[],
) {
  await jobState.setData<compute_v1.Schema$NetworkPeering[]>(
    `network:${networkSelfLink}:peerings`,
    peerings,
  );
}

export async function getNetworkPeerings(
  jobState: JobState,
  networkSelfLink: string,
) {
  return jobState.getData<compute_v1.Schema$NetworkPeering[]>(
    `network:${networkSelfLink}:peerings`,
  );
}

export async function setComputeInstanceServiceAccountData(
  jobState: JobState,
  computeInstanceKeyToServiceAccountDataMap: Map<
    string,
    compute_v1.Schema$ServiceAccount[]
  >,
) {
  await jobState.setData<Map<string, compute_v1.Schema$ServiceAccount[]>>(
    `compute_instance_service_accounts`,
    computeInstanceKeyToServiceAccountDataMap,
  );
}

export async function getComputeInstanceServiceAccountData(jobState: JobState) {
  return jobState.getData<Map<string, compute_v1.Schema$ServiceAccount[]>>(
    `compute_instance_service_accounts`,
  );
}
