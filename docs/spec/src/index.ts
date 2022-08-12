import { IntegrationSpecConfig } from '@jupiterone/integration-sdk-core';
import { functionSteps } from './steps/services/functions';

export const invocationConfig: IntegrationSpecConfig = {
  integrationSteps: [...functionSteps],
};
