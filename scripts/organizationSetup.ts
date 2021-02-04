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
import { retry } from '@lifeomic/attempt';

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
  'sqladmin.googleapis.com',
  'bigquery.googleapis.com',
  'dns.googleapis.com',
  'logging.googleapis.com',
  'monitoring.googleapis.com',
];

export interface BaseSetupOrganizationParams {
  googleAccessToken: string;
  jupiteroneApiKey: string;
  jupiteroneAccountId: string;
  logger: Logger;
  rotateServiceAccountKeys: boolean;
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

interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
}

enum IntegrationInstancePollingInterval {
  DISABLED = 'DISABLED',
  THIRTY_MINUTES = 'THIRTY_MINUTES',
  ONE_HOUR = 'ONE_HOUR',
  FOUR_HOURS = 'FOUR_HOURS',
  EIGHT_HOURS = 'EIGHT_HOURS',
  TWELVE_HOURS = 'TWELVE_HOURS',
  ONE_DAY = 'ONE_DAY',
  ONE_WEEK = 'ONE_WEEK',
}

interface IntegrationInstance {
  id: string;
  name: string;
  description?: string;
  integrationDefinitionId: string;
  pollingInterval: IntegrationInstancePollingInterval;
  config: Record<string, string>;
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
  try {
    const response = await iam.projects.serviceAccounts.get(
      {
        name: `projects/${projectId}/serviceAccounts/jupiterone-integration@${projectId}.iam.gserviceaccount.com`,
      },
      {
        headers: getHeaders(googleAccessToken),
      },
    );

    return response.data;
  } catch (err) {
    if (err.code === 404) {
      return null;
    }

    throw err;
  }
}

async function createServiceAccount(
  googleAccessToken: string,
  projectId: string,
): Promise<iam_v1.Schema$ServiceAccount> {
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

const INTEGRATION_INSTANCES_QUERY = `
query IntegrationInstances($definitionId: String) {
  integrationInstances(definitionId: $definitionId) {
    instances {
      id
      name
      accountId
      pollingInterval
      integrationDefinitionId
      description
      offsiteComplete
    }

    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

const UPDATE_INTEGRATION_INSTANCE_QUERY = `
mutation UpdateIntegrationInstance(
  $id: String!
  $update: UpdateIntegrationInstanceInput!
) {
  updateIntegrationInstance(id: $id, update: $update) {
    name
    pollingInterval
    description
    config
    offsiteComplete
  }
}
`;

interface CreateJupiterOneIntegrationInstanceParams {
  logger: Logger;
  jupiteroneAccountId: string;
  jupiteroneApiKey: string;
  projectId: string;
  serviceAccountKey: string;
  jupiteroneEnv: string;
}

async function createJupiterOneIntegrationInstance({
  logger,
  jupiteroneAccountId,
  jupiteroneApiKey,
  projectId,
  serviceAccountKey,
  jupiteroneEnv,
}: CreateJupiterOneIntegrationInstanceParams): Promise<IntegrationInstance> {
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
            description: 'Created from JupiterOne org script',
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

  const result = await response.json();

  if (result.error) {
    logger.error(
      { err: result.error },
      'Could not create integration instance',
    );
    throw new Error(
      `Failed to get create integration instance (name=${projectId})`,
    );
  }

  const createIntegrationInstanceResult = result.data
    .createIntegrationInstance as IntegrationInstance;
  return createIntegrationInstanceResult;
}

interface IntegrationInstanceUpdateData {
  name?: string;
  description?: string;
  pollingInterval?: IntegrationInstancePollingInterval;
  config?: any;
  offsiteComplete?: boolean;
}

interface UpdateJupiterOneIntegrationInstanceParams {
  logger: Logger;
  integrationInstanceId: string;
  jupiteroneAccountId: string;
  jupiteroneApiKey: string;
  jupiteroneEnv: string;
  integrationInstanceUpdate: IntegrationInstanceUpdateData;
}

async function updateJupiterOneIntegrationInstance({
  logger,
  integrationInstanceId,
  jupiteroneAccountId,
  jupiteroneApiKey,
  jupiteroneEnv,
  integrationInstanceUpdate,
}: UpdateJupiterOneIntegrationInstanceParams): Promise<IntegrationInstance> {
  const response = await fetch(
    `https://api.${jupiteroneEnv}.jupiterone.io/graphql`,
    {
      method: 'post',
      body: JSON.stringify({
        operationName: 'UpdateIntegrationInstance',
        query: UPDATE_INTEGRATION_INSTANCE_QUERY,
        variables: {
          id: integrationInstanceId,
          update: integrationInstanceUpdate,
        },
      }),
      headers: {
        'JupiterOne-Account': jupiteroneAccountId,
        Authorization: `Bearer ${jupiteroneApiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const result = await response.json();

  if (result.error) {
    logger.error(
      { err: result.error },
      'Could not update integration instance',
    );
    throw new Error(
      `Failed to get update integration instance (instanceId=${integrationInstanceId})`,
    );
  }

  const updateIntegrationInstanceResult = result.data
    .updateIntegrationInstance as IntegrationInstance;
  return updateIntegrationInstanceResult;
}

interface IntegrationInstancesQueryApiResult {
  instances: IntegrationInstance[];
  pageInfo: PageInfo;
}

async function getIntegrationInstanceForAccountWithProjectTag(
  logger: Logger,
  jupiteroneAccountId: string,
  jupiteroneApiKey: string,
  projectId: string,
  jupiteroneEnv: string,
): Promise<IntegrationInstance | null> {
  let cursor: string | undefined;

  do {
    const response = await fetch(
      `https://api.${jupiteroneEnv}.jupiterone.io/graphql`,
      {
        method: 'post',
        body: JSON.stringify({
          operationName: 'IntegrationInstances',
          query: INTEGRATION_INSTANCES_QUERY,
          variables: {
            definitionId: GOOGLE_CLOUD_INTEGRATION_DEFINITION_ID,
          },
        }),
        headers: {
          'JupiterOne-Account': jupiteroneAccountId,
          Authorization: `Bearer ${jupiteroneApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = await response.json();

    if (result.error) {
      logger.error(
        { err: result.error },
        'Could not list page of integration instances for project',
      );
      throw new Error('Failed to get existing pages of integration instances');
    }

    const integrationInstancesResult = result.data
      .integrationInstances as IntegrationInstancesQueryApiResult;

    for (const integrationInstance of integrationInstancesResult.instances) {
      if (integrationInstance.name === projectId) {
        return integrationInstance;
      }
    }

    cursor = integrationInstancesResult.pageInfo.endCursor;
  } while (cursor);

  return null;
}

interface PutJupiterOneIntegrationInstanceParams {
  logger: Logger;
  jupiteroneAccountId: string;
  jupiteroneApiKey: string;
  projectId: string;
  serviceAccountKey: string;
  jupiteroneEnv: string;
}

async function putJupiterOneIntegrationInstance({
  logger,
  jupiteroneAccountId,
  jupiteroneApiKey,
  projectId,
  serviceAccountKey,
  jupiteroneEnv,
}: PutJupiterOneIntegrationInstanceParams) {
  logger.info(
    'Attempting to put integration instance for Google Cloud project...',
  );

  const existingIntegrationInstance = await getIntegrationInstanceForAccountWithProjectTag(
    logger,
    jupiteroneAccountId,
    jupiteroneApiKey,
    projectId,
    jupiteroneEnv,
  );

  let integrationInstance: IntegrationInstance;

  if (existingIntegrationInstance) {
    logger.info(
      {
        integrationInstanceId: existingIntegrationInstance.id,
      },
      'Found existing integation instance to update...',
    );

    integrationInstance = await updateJupiterOneIntegrationInstance({
      logger,
      jupiteroneAccountId,
      jupiteroneApiKey,
      jupiteroneEnv,
      integrationInstanceId: existingIntegrationInstance.id,
      integrationInstanceUpdate: {
        name: projectId,
        pollingInterval: existingIntegrationInstance.pollingInterval,
        description: 'Created from JupiterOne org script',
        config: {
          '@tag': {
            AccountName: projectId,
          },
          serviceAccountKeyFile: serviceAccountKey,
        },
      },
    });
  } else {
    logger.info('Creating new integration instance...');

    integrationInstance = await createJupiterOneIntegrationInstance({
      logger,
      jupiteroneAccountId,
      jupiteroneApiKey,
      projectId,
      serviceAccountKey,
      jupiteroneEnv,
    });
  }

  return integrationInstance;
}

interface MutateOrgPolicyParams {
  logger: Logger;
  serviceAccountEmail: string;
  googleAccessToken: string;
  projectId: string;
}

/**
 * The Google Cloud documentation suggests that to update a policy we must:
 *
 * 1. Read the existing policy
 * 2. Modify the policy
 * 3. Write the entire new policy
 *
 * This can cause concurrent policy change errors, so we retry the entire
 * operation if we receive a 409 response status code.
 *
 * See: https://cloud.google.com/iam/docs/policies#etag
 */
async function updateOrgPolicy({
  logger,
  serviceAccountEmail,
  googleAccessToken,
  projectId,
}: MutateOrgPolicyParams) {
  await retry(
    async () => {
      logger.info('Fetching policy for project...');
      const projectPolicy = await getPolicyForProject(
        googleAccessToken,
        projectId,
      );

      const newPolicy = buildPolicyWithServiceAccountSecurityRoleMember(
        projectPolicy,
        serviceAccountEmail,
      );

      logger.info('Attempting to update IAM policy for project...');
      await setIamPolicyForProject(googleAccessToken, projectId, newPolicy);
      logger.info('Successfully updated IAM policy for project...');
    },
    {
      delay: 500,
      maxAttempts: 5,
      factor: 1.1,
      handleError(err, attemptContext) {
        if (
          (err.code === 409 || err.code === 'ALREADY_EXISTS') &&
          attemptContext.attemptsRemaining
        ) {
          logger.info(
            { code: err.code },
            'Concurrent policy changes while updating org policy (will retry)',
          );
        } else if (attemptContext.attemptsRemaining) {
          logger.warn({ err }, 'Error updating org policy (will retry)');
        }
      },
    },
  );
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
    rotateServiceAccountKeys,
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

  logger.info('Checking if existing service account exists');
  const existingServiceAccount = await getJupiterOneServiceAccountForProject(
    googleAccessToken,
    projectId,
  );

  // If we already have a service account and we are not rotating service account
  // keys, then we can just exit early.
  if (existingServiceAccount && !rotateServiceAccountKeys) {
    logger.info('Project already has a JupiterOne service account configured');
    return SetupOrganizationProjectResult.EXISTS;
  }

  let serviceAccount: iam_v1.Schema$ServiceAccount | null = existingServiceAccount;
  let serviceAccountEmail = serviceAccount?.email as string;

  if (serviceAccount) {
    logger.info(
      {
        serviceAccountEmail,
      },
      'Service account already exists. Key will be rotated...',
    );
  } else {
    logger.info('Creating service account for project');
    serviceAccount = await createServiceAccount(googleAccessToken, projectId);

    serviceAccountEmail = serviceAccount.email as string;
  }

  logger.info(
    {
      serviceAccountEmail,
    },
    'Successfully created service account for project',
  );

  await updateOrgPolicy({
    logger,
    serviceAccountEmail,
    googleAccessToken,
    projectId,
  });

  logger.info('Attempting to create service account key for project...');

  const serviceAccountKeyResponse = await createServiceAccountKey(
    googleAccessToken,
    projectId,
    serviceAccountEmail,
  );

  const serviceAccountKey = decodeServiceAccountKeyFile(
    serviceAccountKeyResponse,
  );

  logger.info(
    {
      serviceAccountKeyName: serviceAccountKeyResponse.name,
    },
    'Successfully created service account key for project.',
  );

  try {
    const result = await putJupiterOneIntegrationInstance({
      logger,
      jupiteroneAccountId,
      jupiteroneApiKey,
      projectId,
      serviceAccountKey,
      jupiteroneEnv,
    });

    logger.info(
      {
        integrationInstanceId: result.id,
        projectId,
      },
      'Successfully put JupiterOne integration instance for Google Cloud project',
    );

    return SetupOrganizationProjectResult.CREATED;
  } catch (err) {
    logger.error(
      {
        err,
        jupiteroneAccountId,
        projectId,
        jupiteroneEnv,
      },
      'Could not create integration instance in account. Please check the provided J1 account ID and API key',
    );
    return SetupOrganizationProjectResult.FAILED;
  }
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
    rotateServiceAccountKeys,
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
        logger.info('Attempting to fetch project details...');
        project = await getProject(googleAccessToken, projectId);
        logger.info(
          {
            projectNumber: project.projectNumber,
          },
          'Successfully fetched project details',
        );
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
          rotateServiceAccountKeys,
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
              rotateServiceAccountKeys,
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
