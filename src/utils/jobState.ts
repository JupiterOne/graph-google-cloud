import { JobState } from '@jupiterone/integration-sdk-core';
import { cloudresourcemanager_v3, compute_v1 } from 'googleapis';
import { compact } from 'lodash';

export const PEERED_NETWORKS = 'network:all_peerings';
export const IS_PUBLIC_PREFIX = 'isPublic';

const ACCESS_LEVEL_ORDERED = ['private', 'publicRead', 'publicWrite'];
export interface AccessData {
  accessLevel?: 'private' | 'public' | 'publicRead' | 'publicWrite';
  condition?: string;
}

export async function cacheIfResourceIsPublic(
  jobState: JobState,
  {
    type,
    key,
    accessLevel: newAccessLevel,
    condition: newCondition,
  }: {
    type: string;
    key: string;
  } & AccessData,
) {
  // If there is an existing value for this resource, we only want to overwrite it if the new value represents more public access than the existing value.
  const { accessLevel: oldAccessLevel, condition: existingCondition } =
    (await getIfResourceIsPublic(jobState, type, key)) ?? {};

  const oldOpenness = ACCESS_LEVEL_ORDERED.findIndex(
    (c) => c == oldAccessLevel,
  );
  const newOpenness = ACCESS_LEVEL_ORDERED.findIndex(
    (c) => c == newAccessLevel,
  );

  // If the new access level is more open than the existing access level, replace the value.
  if (newOpenness > oldOpenness) {
    await jobState.setData(`${IS_PUBLIC_PREFIX}:${type}:${key}`, {
      accessLevel: newAccessLevel,
      condition: newCondition,
    });
    // If the access levels are the same:
    // if there is no new condition, then this resource is always open, so set the conditon to undefined,
    // else, join the conditions togeather with OR as access is granted by either condition.
  } else if (newOpenness === oldOpenness && existingCondition)
    await jobState.setData(`${IS_PUBLIC_PREFIX}:${type}:${key}`, {
      accessLevel: newAccessLevel,
      condition: newCondition
        ? compact([existingCondition, newCondition]).join(' OR ')
        : undefined,
    });
}

export async function getIfResourceIsPublic(
  jobState: JobState,
  type: string,
  key: string,
): Promise<AccessData | undefined> {
  return await jobState.getData<AccessData>(
    `${IS_PUBLIC_PREFIX}:${type}:${key}`,
  );
}

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
