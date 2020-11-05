import { Headers } from 'gaxios';
import { google, cloudresourcemanager_v1, iam_v1 } from 'googleapis';
import { iterateApi } from '../src/google-cloud/client';
import fetch from 'node-fetch';
import Logger from 'bunyan';

const cloudresourcemanager = google.cloudresourcemanager('v1');
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
  projectIds?: string[];
}

export interface SetupOrganizationProjectParams
  extends BaseSetupOrganizationParams {
  project: cloudresourcemanager_v1.Schema$Project;
}

function getHeaders(googleAccessToken: string): Headers {
  return {
    Authorization: `Bearer ${googleAccessToken}`,
  };
}

async function iterateProjects(
  googleAccessToken: string,
  callback: (data: cloudresourcemanager_v1.Schema$Project) => Promise<void>,
) {
  await iterateApi(
    async (nextPageToken) => {
      return cloudresourcemanager.projects.list(
        {
          pageToken: nextPageToken,
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

function buildPolicyWithServiceAccountSecurityRoleMember(
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
) {
  const response = await fetch('https://api.us.jupiterone.io/graphql', {
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
      'LifeOmic-Account': jupiteroneAccountId,
      Authorization: `Bearer ${jupiteroneApiKey}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

async function setupOrganizationProject(
  params: SetupOrganizationProjectParams,
) {
  const {
    googleAccessToken,
    jupiteroneApiKey,
    jupiteroneAccountId,
    project,
    logger,
  } = params;

  const projectId = project.projectId as string;

  if (project.parent?.type === 'folder') {
    logger.info('Skipping configuration for folder');
    return;
  }

  if (project.lifecycleState !== 'ACTIVE') {
    logger.info(
      {
        lifecycleState: project.lifecycleState,
      },
      'Skipping configuration for project with non-ACTIVE lifecycle state',
    );
    return;
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
      logger.error('Error enabling project services', err);
    }

    return;
  }

  const existingServiceAccount = await getJupiterOneServiceAccountForProject(
    googleAccessToken,
    projectId,
  );

  if (existingServiceAccount) {
    logger.info('Project already has a JupiterOne service account configured');
    return;
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

  const instance = await createJupiterOneIntegrationInstance(
    jupiteroneAccountId,
    jupiteroneApiKey,
    projectId,
    serviceAccountKey,
  );

  logger.info(
    {
      integrationInstanceId: instance.id,
      projectId,
    },
    'Integration instance created for Google Cloud project',
  );
}

export async function setupOrganization(params: SetupOrganizationParams) {
  const {
    googleAccessToken,
    jupiteroneApiKey,
    jupiteroneAccountId,
    projectIds,
    logger: baseLogger,
  } = params;

  if (projectIds) {
    baseLogger.info(
      {
        projectIds,
      },
      'Setting up JupiterOne Google Cloud projects',
    );

    for (const projectId of projectIds) {
      const logger = baseLogger.child({ projectId });

      let project: cloudresourcemanager_v1.Schema$Project;

      try {
        project = await getProject(googleAccessToken, projectId);
      } catch (err) {
        logger.error({ err }, 'Error fetching project details');
        // Continue moving forward if a single project fails to be created!
        continue;
      }

      try {
        await setupOrganizationProject({
          googleAccessToken,
          jupiteroneApiKey,
          jupiteroneAccountId,
          project,
          logger,
        });
      } catch (err) {
        logger.error({ err }, 'Error running setup for project');
        // Continue moving forward if a single project fails to be created!
      }
    }
  } else {
    baseLogger.info('Setting up all JupiterOne Google Cloud projects');

    await iterateProjects(googleAccessToken, async (project) => {
      const logger = baseLogger.child({ projectId: project.projectId });

      try {
        await setupOrganizationProject({
          googleAccessToken,
          jupiteroneApiKey,
          jupiteroneAccountId,
          project,
          logger,
        });
      } catch (err) {
        logger.error({ err }, 'Error running setup for project');
        // Continue moving forward if a single project fails to be created!
      }
    });
  }
}
