import { IntegrationSpecConfig } from '@jupiterone/integration-sdk-core';
import { buildSteps } from './steps/services/build';
import { functionSteps } from './steps/services/functions';
import { webSecurityScannerSteps } from './steps/services/web-security-scanner';

export const invocationConfig: IntegrationSpecConfig = {
  integrationSteps: [
    ...buildSteps,
    ...functionSteps,
    ...webSecurityScannerSteps,
  ],
};
