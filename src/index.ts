import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { deserializeIntegrationConfig } from './utils/integrationConfig';
import { IntegrationConfig } from './types';
import getStepStartStates from './getStepStartStates';
import { Client } from './google-cloud/client';
import { maybeDefaultProjectIdOnEntity } from './utils/maybeDefaultProjectIdOnEntity';
import { steps } from './steps/steps';

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
  };

export {
  IntegrationConfig,
  deserializeIntegrationConfig,
  Client as GoogleCloudClient,
};
