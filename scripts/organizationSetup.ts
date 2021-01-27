import { Headers } from 'gaxios';
import {
  google,
  cloudresourcemanager_v1,
  cloudresourcemanager_v2,
  iam_v1,
} from 'googleapis';
import { iterateApi } from '../src/google-cloud/client';
import fetch from 'node-fetch';
import Logger from 'bunyan';

const cloudresourcemanager = google.cloudresourcemanager('v1');
const cloudresourcemanagerV2 = google.cloudresourcemanager('v2');
const iam = google.iam('v1');
const serviceusage = google.serviceusage('v1');

const GOOGLE_CLOUD_INTEGRATION_DEFINITION_ID =
  '0c652a0a-1e86-4c35-b7f7-6b792731818b';
const SECURITY_REVIEWER_ROLE = 'roles/iam.securityReviewer';

const PROJECT_SERVICES_TO_ENABLE: string[] = [
  'serviceusage.googleapis.com',
  'cloudfunctions.googleapis.com',
  'storage.googleapis.com',
  'iam.googleapis.com',
  'cloudresourcemanager.googleapis.com',
  'compute.googleapis.com',
  'cloudkms.googleapis.com',
];

export interface BaseSetupOrganizationParams {
  googleAccessToken: string;
  jupiteroneApiKey: string;
  jupiteroneAccountId: string;
  logger: Logger;
}

export interface SetupOrganizationParams extends BaseSetupOrganizationParams {
  organizationIds?: string[];
  projectIds?: string[];
  skipProjectIds?: string[];
  jupiteroneEnv?: string;
  skipSystemProjects: boolean;
}

export interface SetupOrganizationProjectParams
  extends BaseSetupOrganizationParams {
  project: cloudresourcemanager_v1.Schema$Project;
  jupiteroneEnv: string;
}

function getHeaders(googleAccessToken: string): Headers {
  return {
    Authorization: `Bearer ${googleAccessToken}`,
  };
}

function getProjectFilter(parentId: string) {
  return `parent.id=${parentId} AND lifecycleState=ACTIVE`;
}

function getParentResourceName(parentType: string, parentId: string) {
  return `${parentType}/${parentId}`;
}

function getResourceIdFromResourceName(resourceName: string) {
  return resourceName.split('/')[1];
}

async function iterateFolders(
  googleAccessToken: string,
  parent: string,
  callback: (data: cloudresourcemanager_v2.Schema$Folder) => Promise<void>,
) {
  await iterateApi(
    async (nextPageToken) => {
      return cloudresourcemanagerV2.folders.list(
        {
          pageToken: nextPageToken,
          parent,
        },
        {
          headers: getHeaders(googleAccessToken),
        },
      );
    },
    async (data: cloudresourcemanager_v2.Schema$ListFoldersResponse) => {
      for (const item of data.folders || []) {
        await callback(item);
      }
    },
  );
}

async function iterateProjects(
  googleAccessToken: string,
  filter: string,
  callback: (data: cloudresourcemanager_v1.Schema$Project) => Promise<void>,
) {
  await iterateApi(
    async (nextPageToken) => {
      return cloudresourcemanager.projects.list(
        {
          pageToken: nextPageToken,
          filter,
        },
        {
          headers: getHeaders(googleAccessToken),
        },
      );
    },
    async (data: cloudresourcemanager_v1.Schema$ListProjectsResponse) => {
      for (const item of data.projects || []) {
        await callback(item);
      }
    },
  );
}

async function iterateAllProjectFoldersInTree(
  googleAccessToken: string,
  parentResourceType: string,
  parentResourceId: string,
  callback: (data: cloudresourcemanager_v1.Schema$Project) => Promise<void>,
) {
  await iterateFolders(
    googleAccessToken,
    getParentResourceName(parentResourceType, parentResourceId),
    async (folder) => {
      await iterateAllProjectsInTree(
        googleAccessToken,
        'folders',
        getResourceIdFromResourceName(folder.name as string),
        callback,
      );
    },
  );
}

async function iterateAllProjectsInTree(
  googleAccessToken: string,
  parentResourceType: string,
  parentResourceId: string,
  callback: (data: cloudresourcemanager_v1.Schema$Project) => Promise<void>,
) {
  await iterateProjects(
    googleAccessToken,
    getProjectFilter(parentResourceId),
    callback,
  );

  await iterateAllProjectFoldersInTree(
    googleAccessToken,
    parentResourceType,
    parentResourceId,
    callback,
  );
}

async function getProject(googleAccessToken: string, projectId: string) {
  const result = await cloudresourcemanager.projects.get(
    { projectId },
    {
      headers: getHeaders(googleAccessToken),
    },
  );

  return result.data;
}

async function getJupiterOneServiceAccountForProject(
  googleAccessToken: string,
  projectId: string,
) {
  let nextPageToken: string | undefined;

  do {
    const result = await iam.projects.serviceAccounts.list(
      {
        name: `projects/${projectId}`,
        pageToken: nextPageToken,
      },
      {
        headers: getHeaders(googleAccessToken),
      },
    );

    nextPageToken = result.data.nextPageToken || undefined;

    for (const account of result.data.accounts || []) {
      if (account.email?.startsWith('jupiterone-integration')) {
        return account;
      }
    }
  } while (nextPageToken);
}

async function createServiceAccount(
  googleAccessToken: string,
  projectId: string,
) {
  const response = await iam.projects.serviceAccounts.create(
    {
      name: `projects/${projectId}`,
      requestBody: {
        accountId: 'jupiterone-integration',
        serviceAccount: {
          description: 'JupiterOne integration service account',
        },
      },
    },
    {
      headers: getHeaders(googleAccessToken),
    },
  );

  return response.data;
}

async function createServiceAccountKey(
  googleAccessToken: string,
  projectId: string,
  serviceAccountEmail: string,
) {
  const response = await iam.projects.serviceAccounts.keys.create(
    {
      name: `projects/${projectId}/serviceAccounts/${serviceAccountEmail}`,
    },
    {
      headers: getHeaders(googleAccessToken),
    },
  );

  return response.data;
}

function decodeServiceAccountKeyFile(key: iam_v1.Schema$ServiceAccountKey) {
  return Buffer.from(key.privateKeyData as string, 'base64').toString('ascii');
}

async function getPolicyForProject(
  googleAccessToken: string,
  projectId: string,
) {
  const response = await cloudresourcemanager.projects.getIamPolicy(
    {
      resource: projectId,
      requestBody: {
        options: {
          // Policies are versioned and specifying this version will return
          // different data. The only way to fetch `conditions` on the
          // policies is to specify "3".
          //
          // See: https://cloud.google.com/iam/docs/reference/rest/v1/Policy
          requestedPolicyVersion: 3,
        },
      },
    },
    {
      headers: getHeaders(googleAccessToken),
    },
  );

  return response.data;
}

function serviceAccountEmailToServiceAccountMember(
  serviceAccountEmail: string,
) {
  return `serviceAccount:${serviceAccountEmail}`;
}

export function buildPolicyWithServiceAccountSecurityRoleMember(
  policy: cloudresourcemanager_v1.Schema$Policy,
  serviceAccountEmail: string,
) {
  const newBindings: cloudresourcemanager_v1.Schema$Binding[] = [];
  let foundSecurityPolicyBinding = false;

  const serviceAccountMember = serviceAccountEmailToServiceAccountMember(
    serviceAccountEmail,
  );

  for (const binding of policy.bindings || []) {
    const role = binding.role as string;

    if (role === SECURITY_REVIEWER_ROLE && binding.members) {
      const isServiceAccountMember =
        binding.members.indexOf(serviceAccountMember) !== -1;
      foundSecurityPolicyBinding = true;

      if (isServiceAccountMember) {
        // This is just a sanity check. The service account should not already
        // be a member of this role.
        newBindings.push(binding);
        continue;
      }

      newBindings.push({
        ...binding,
        members: [...binding.members, serviceAccountMember],
      });
    } else {
      newBindings.push(binding);
    }
  }

  if (!foundSecurityPolicyBinding) {
    newBindings.push({
      role: SECURITY_REVIEWER_ROLE,
      members: [serviceAccountMember],
    });
  }

  return {
    ...policy,
    bindings: newBindings,
  };
}

async function setIamPolicyForProject(
  googleAccessToken: string,
  projectId: string,
  policy: cloudresourcemanager_v1.Schema$Policy,
) {
  const response = await cloudresourcemanager.projects.setIamPolicy(
    {
      resource: projectId,
      requestBody: {
        policy,
      },
    },
    {
      headers: getHeaders(googleAccessToken),
    },
  );

  return response.data;
}

async function enableProjectServices(
  googleAccessToken: string,
  projectId: string,
  serviceNames: string[],
) {
  for (const serviceName of serviceNames) {
    await serviceusage.services.enable(
      {
        name: `projects/${projectId}/services/${serviceName}`,
      },
      {
        headers: getHeaders(googleAccessToken),
      },
    );
  }
}

const CREATE_JUPITERONE_INTEGRATION_INSTANCE_MUTATION = `
mutation CreateIntegrationInstance($instance: CreateIntegrationInstanceInput!) {
  createIntegrationInstance(instance: $instance) {
    id
    name
  }
}
`;

async function createJupiterOneIntegrationInstance(
  jupiteroneAccountId: string,
  jupiteroneApiKey: string,
  projectId: string,
  serviceAccountKey: string,
  jupiteroneEnv: string,
) {
  const response = await fetch(
    `https://api.${jupiteroneEnv}.jupiterone.io/graphql`,
    {
      method: 'post',
      body: JSON.stringify({
        operationName: 'CreateIntegrationInstance',
        query: CREATE_JUPITERONE_INTEGRATION_INSTANCE_MUTATION,
        variables: {
          instance: {
            name: projectId,
            pollingInterval: 'ONE_DAY',
            config: {
              '@tag': {
                AccountName: projectId,
              },
              serviceAccountKeyFile: serviceAccountKey,
            },
            integrationDefinitionId: GOOGLE_CLOUD_INTEGRATION_DEFINITION_ID,
          },
        },
      }),
      headers: {
        'JupiterOne-Account': jupiteroneAccountId,
        Authorization: `Bearer ${jupiteroneApiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.json();
}

enum SetupOrganizationProjectResult {
  CREATED = 'CREATED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  EXISTS = 'EXISTS',
}

async function setupOrganizationProject(
  params: SetupOrganizationProjectParams,
): Promise<SetupOrganizationProjectResult> {
  const {
    googleAccessToken,
    jupiteroneApiKey,
    jupiteroneAccountId,
    project,
    logger,
    jupiteroneEnv,
  } = params;

  const projectId = project.projectId as string;

  if (project.lifecycleState !== 'ACTIVE') {
    logger.info(
      {
        lifecycleState: project.lifecycleState,
      },
      'Skipping configuration for project with non-ACTIVE lifecycle state',
    );
    return SetupOrganizationProjectResult.SKIPPED;
  }

  try {
    logger.info('Enabling API services in project...');

    await enableProjectServices(
      googleAccessToken,
      projectId,
      PROJECT_SERVICES_TO_ENABLE,
    );
  } catch (err) {
    if (err.errors) {
      logger.error({ errors: err.errors }, 'Error enabling project services');
    } else {
      logger.error({ err }, 'Error enabling project services');
    }

    return SetupOrganizationProjectResult.FAILED;
  }

  const existingServiceAccount = await getJupiterOneServiceAccountForProject(
    googleAccessToken,
    projectId,
  );

  if (existingServiceAccount) {
    logger.info('Project already has a JupiterOne service account configured');
    return SetupOrganizationProjectResult.EXISTS;
  }

  const projectPolicy = await getPolicyForProject(googleAccessToken, projectId);
  const serviceAccount = await createServiceAccount(
    googleAccessToken,
    projectId,
  );
  const serviceAccountEmail = serviceAccount?.email as string;

  const newPolicy = buildPolicyWithServiceAccountSecurityRoleMember(
    projectPolicy,
    serviceAccountEmail,
  );

  await setIamPolicyForProject(googleAccessToken, projectId, newPolicy);

  const serviceAccountKey = decodeServiceAccountKeyFile(
    await createServiceAccountKey(
      googleAccessToken,
      projectId,
      serviceAccountEmail,
    ),
  );

  const result = await createJupiterOneIntegrationInstance(
    jupiteroneAccountId,
    jupiteroneApiKey,
    projectId,
    serviceAccountKey,
    jupiteroneEnv,
  );

  if (result.error) {
    logger.error(
      {
        result,
        jupiteroneAccountId,
        projectId,
        jupiteroneEnv,
      },
      'Could not create integration instance in account. Please check the provided J1 account ID and API key',
    );
    return SetupOrganizationProjectResult.FAILED;
  }

  logger.info(
    {
      result,
      integrationInstanceId: result.id,
      projectId,
    },
    'Integration instance created for Google Cloud project',
  );

  return SetupOrganizationProjectResult.CREATED;
}

export interface SetupOrganizationResult {
  created: string[];
  failed: string[];
  skipped: string[];
  exists: string[];
}

export async function setupOrganization(
  params: SetupOrganizationParams,
): Promise<SetupOrganizationResult> {
  const {
    googleAccessToken,
    jupiteroneApiKey,
    jupiteroneAccountId,
    organizationIds,
    projectIds,
    skipProjectIds,
    logger: baseLogger,
    jupiteroneEnv = 'us',
    skipSystemProjects,
  } = params;

  const result: SetupOrganizationResult = {
    created: [],
    failed: [],
    skipped: [],
    exists: [],
  };

  if (projectIds) {
    baseLogger.info(
      {
        projectIds,
      },
      'Setting up JupiterOne Google Cloud projects',
    );

    for (const projectId of projectIds) {
      const logger = baseLogger.child({ projectId });

      if (skipSystemProjects && projectId.startsWith('sys-')) {
        logger.info('Skipping system project');
        result.skipped.push(projectId);
        continue;
      }

      if (skipProjectIds?.includes(projectId)) {
        logger.info('Skipping project');
        result.skipped.push(projectId);
        continue;
      }

      let project: cloudresourcemanager_v1.Schema$Project;

      try {
        project = await getProject(googleAccessToken, projectId);
      } catch (err) {
        logger.error({ err }, 'Error fetching project details');
        // Continue moving forward if a single project fails to be created!
        result.failed.push(projectId);
        continue;
      }

      try {
        const setupResult = await setupOrganizationProject({
          googleAccessToken,
          jupiteroneApiKey,
          jupiteroneAccountId,
          project,
          logger,
          jupiteroneEnv,
        });

        result[setupResult.toLowerCase()].push(projectId);
      } catch (err) {
        logger.error({ err }, 'Error running setup for project');
        // Continue moving forward if a single project fails to be created!
        result.failed.push(projectId);
      }
    }
  } else if (organizationIds) {
    baseLogger.info('Setting up all JupiterOne Google Cloud projects');

    for (const organizationId of organizationIds) {
      await iterateAllProjectsInTree(
        googleAccessToken,
        'organizations',
        organizationId,
        async (project) => {
          const projectId = project.projectId as string;
          const logger = baseLogger.child({ projectId });

          if (skipSystemProjects && projectId.startsWith('sys-')) {
            logger.info('Skipping system project');
            result.skipped.push(projectId);
            return;
          }

          if (skipProjectIds?.includes(projectId)) {
            logger.info('Skipping project');
            result.skipped.push(projectId);
            return;
          }

          logger.info('Setting up project');

          try {
            const setupResult = await setupOrganizationProject({
              googleAccessToken,
              jupiteroneApiKey,
              jupiteroneAccountId,
              project,
              logger,
              jupiteroneEnv,
            });

            result[setupResult.toLowerCase()].push(projectId);
          } catch (err) {
            logger.error({ err }, 'Error running setup for project');
            // Continue moving forward if a single project fails to be created!
            result.failed.push(projectId);
          }
        },
      );
    }
  } else {
    throw new Error('"organizationIds" or "projectIds" required');
  }

  return result;
}
