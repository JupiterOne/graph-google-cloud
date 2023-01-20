import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { validateInvocation } from './config';
import getStepStartStates from './getStepStartStates';
import { Client } from './google-cloud/client';
import { steps } from './steps/steps';
import { IntegrationConfig } from './types';
import { deserializeIntegrationConfig } from './utils/integrationConfig';
import { maybeDefaultProjectIdOnEntity } from './utils/maybeDefaultProjectIdOnEntity';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> =
  {
    instanceConfigFields: {
      serviceAccountKeyFile: {
        type: 'string',
        mask: true,
      },
      projectId: {
        type: 'string',
      },
      organizationId: {
        type: 'string',
      },
      configureOrganizationProjects: {
        type: 'boolean',
        mask: false,
      },
      folderId: {
        type: 'string',
      },
    },
    getStepStartStates,
    integrationSteps: steps,
    dependencyGraphOrder: ['last'],
    beforeAddEntity: maybeDefaultProjectIdOnEntity,
    validateInvocation,
  };

export {
  IntegrationConfig,
  deserializeIntegrationConfig,
  Client as GoogleCloudClient,
};
