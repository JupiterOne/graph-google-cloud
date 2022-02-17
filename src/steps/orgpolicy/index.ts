import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { OrgPolicyClient } from './client';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { STEP_ORGANIZATION_POLICIES } from './constants';
import { ResourceManagerClient } from '../resource-manager/client';
import { orgpolicy_v2 } from 'googleapis';

interface Folder {
  parent: string;
  name: string;
  projects: string[];
}

export enum NearestOrgPolicyResult {
  NOT_FOUND,
  FOUND,
}

async function getFolderPaths(client: ResourceManagerClient) {
  const folderPaths: Folder[] = [];

  const getAllInnerFolders = async (
    client: ResourceManagerClient,
    parentFolderName: string,
  ) => {
    await client.iterateFolders(async (folder) => {
      folderPaths.push({
        parent: folder.parent!,
        name: folder.name!,
        projects: [],
      });
      await getAllInnerFolders(client, folder.name!);
    }, parentFolderName);
  };

  // Iterate organization's folders (starting point)
  await client.iterateFolders(async (folder) => {
    folderPaths.push({
      parent: folder.parent!,
      name: folder.name!,
      projects: [],
    });
    await getAllInnerFolders(client, folder.name!);
  });

  for (const folder of folderPaths) {
    await client.iterateProjects(async (project) => {
      const targetFolder = folderPaths.find(
        (folderEl) => folderEl.name === folder.name,
      );
      if (targetFolder) {
        targetFolder.projects.push(project.projectId!);
      }
      return Promise.resolve();
    }, folder.name);
  }

  return folderPaths;
}

export interface OrgPolicyResult {
  organizationPolicy:
    | orgpolicy_v2.Schema$GoogleCloudOrgpolicyV2Policy
    | undefined;
  result: NearestOrgPolicyResult;
}

async function findNearestOrgPolicy(
  client: OrgPolicyClient,
  rmClient: ResourceManagerClient,
): Promise<OrgPolicyResult> {
  let result = NearestOrgPolicyResult.NOT_FOUND;
  let organizationPolicy:
    | orgpolicy_v2.Schema$GoogleCloudOrgpolicyV2Policy
    | undefined = undefined;

  await client.iterateOrganizationPolicies(
    `projects/${client.projectId}`,
    async (orgPolicy) => {
      // If policy has "inherit" value, it won't be returned here, so we don't need to check if it's "inherit"|"enforced=true"|"enforced=false"
      if (
        !organizationPolicy &&
        orgPolicy.name?.includes('storage.publicAccessPrevention')
      ) {
        organizationPolicy = orgPolicy;
        result = NearestOrgPolicyResult.FOUND;
      }
      return Promise.resolve();
    },
  );

  if (organizationPolicy) {
    return {
      organizationPolicy,
      result,
    };
  }

  // A helper function that prepares data
  // ex: folderPaths = [ { parent: "organizations/958457776463", name: "folders/306329820365", projects: [ 'j1-gc-integration-dev-v3' ] }, ...]
  const folderPaths = await getFolderPaths(rmClient);

  const foundProjectFolder = folderPaths.find((path) =>
    path.projects.includes(client.projectId),
  );

  if (!foundProjectFolder) {
    // The project wasn't part of any folders and we haven't found its own organization policy
    return {
      organizationPolicy,
      result,
    };
  }

  const dependencyPaths: string[] = [
    foundProjectFolder.name,
    foundProjectFolder.parent,
  ];

  let hasParent = foundProjectFolder.parent;
  while (hasParent) {
    const parentFolder = folderPaths.find((path) => path.name === hasParent);
    if (!parentFolder) {
      break;
    }

    dependencyPaths.push(parentFolder.parent);
    hasParent = parentFolder.parent;
  }

  for (const pathSegment of dependencyPaths) {
    if (organizationPolicy) {
      break;
    }
    await client.iterateOrganizationPolicies(pathSegment, async (orgPolicy) => {
      // If policy has "inherit" value, it won't be returned here, so we don't need to check if it's "inherit"|"enforced=true"|"enforced=false"
      if (
        !organizationPolicy &&
        orgPolicy.name?.includes('storage.publicAccessPrevention')
      ) {
        organizationPolicy = orgPolicy;
        result = NearestOrgPolicyResult.FOUND;
      }
      return Promise.resolve();
    });
  }

  return {
    organizationPolicy,
    result,
  };
}

export async function fetchOrganizationPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;
  const policyClient = new OrgPolicyClient({ config });
  const resourceManagerClient = new ResourceManagerClient({ config });

  const organizationPolicy = await findNearestOrgPolicy(
    policyClient,
    resourceManagerClient,
  );

  /* There are 3 possible cases:

  Case 1: The step failed to run
  Reasons: customer didn't assign permissions for listing folders or org policies)
    resourcemanager.folders.list (Organization Administrator role)
    orgpolicy.policies.list (Organization Policy Administrator)

  The return value will be undefined and we can't trust the state of the public (from the previous code).

  Case 2: The step ran but didn't find any enforced policies.
  The return object will contain:
    result: NearestOrgPolicyResult.NOT_FOUND
    organizationPolicy: undefined
  We can trust other public state properties (previous code).

  Case 3: The step ran and found enforced policy.
    result: NearestOrgPolicyResult.FOUND
    organizationPolicy: <organizationPolicyData>

  a): The enforced policy was 'true' (enforce preventPublicAccess)
   This overwrites any other public state properties and we know the buckets aren't public.
  b): The enforced policy was 'false' (enforce preventPublicAccess)
   This means we have to trust other public state properties (previous code).
  */

  await jobState.setData(
    'organization_policy:public_access_prevention',
    organizationPolicy,
  );
}

export const orgPolicySteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_ORGANIZATION_POLICIES,
    name: 'Cloud Organization Policies',
    entities: [],
    relationships: [],
    executionHandler: fetchOrganizationPolicies,
  },
];
