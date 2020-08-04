import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './types';
import getStepStartStates from './getStepStartStates';
import { functionsSteps } from './steps/functions';
import { storageSteps } from './steps/storage';
import { serviceUsageSteps } from './steps/service-usage';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields: {
    serviceAccountKeyFile: {
      type: 'string',
      mask: true,
    },
  },
  getStepStartStates,
  integrationSteps: [...functionsSteps, ...storageSteps, ...serviceUsageSteps],
};
