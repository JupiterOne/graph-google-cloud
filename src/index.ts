import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './types';
import getStepStartStates from './getStepStartStates';
import { functionsSteps } from './steps/functions';
import { storageSteps } from './steps/storage';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields: {
    privateKey: {
      type: 'string',
      mask: true,
    },
    clientEmail: {
      type: 'string',
      mask: true,
    },
    projectId: {
      type: 'string',
      mask: false,
    },
  },
  getStepStartStates,
  integrationSteps: [...functionsSteps, ...storageSteps],
};
