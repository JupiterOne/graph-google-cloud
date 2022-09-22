import { IntegrationSpecConfig } from '@jupiterone/integration-sdk-core';
import { buildSteps } from './steps/services/build';
import { functionSteps } from './steps/services/functions';

export const invocationConfig: IntegrationSpecConfig = {
  integrationSteps: [...buildSteps, ...functionSteps],
};
