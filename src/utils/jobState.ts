import { JobState } from '@jupiterone/integration-sdk-core';
import { cloudresourcemanager_v3, compute_v1 } from 'googleapis';

export const PEERED_NETWORKS = 'network:all_peerings';

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
