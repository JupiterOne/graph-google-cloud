import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './types';
import getStepStartStates from './getStepStartStates';
import { functionsSteps } from './steps/functions';
import { storageSteps } from './steps/storage';
import { serviceUsageSteps } from './steps/service-usage';
import { iamSteps } from './steps/iam';
import { resourceManagerSteps } from './steps/resource-manager';
import { computeSteps } from './steps/compute';
import { kmsSteps } from './steps/kms';
import { sqlAdminSteps } from './steps/sql-admin';
import { bigQuerySteps } from './steps/big-query';
import { dnsManagedZonesSteps } from './steps/dns';
import { containerSteps } from './steps/containers';
import { loggingSteps } from './steps/logging';
import { monitoringSteps } from './steps/monitoring';
import { binaryAuthorizationSteps } from './steps/binary-authorization';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields: {
    serviceAccountKeyFile: {
      type: 'string',
      mask: true,
    },
  },
  getStepStartStates,
  integrationSteps: [
    ...functionsSteps,
    ...storageSteps,
    ...serviceUsageSteps,
    ...iamSteps,
    ...resourceManagerSteps,
    ...computeSteps,
    ...kmsSteps,
    ...sqlAdminSteps,
    ...bigQuerySteps,
    ...dnsManagedZonesSteps,
    ...containerSteps,
    ...loggingSteps,
    ...monitoringSteps,
    ...binaryAuthorizationSteps,
  ],
};
