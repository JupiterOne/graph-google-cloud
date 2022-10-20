import { IntegrationSpecConfig } from '@jupiterone/integration-sdk-core';
import { buildSteps } from './steps/services/build';
import { functionSteps } from './steps/services/functions';
import { recommenderSteps } from './steps/services/recommender';

export const invocationConfig: IntegrationSpecConfig = {
  integrationSteps: [...buildSteps, ...functionSteps, ...recommenderSteps],
};
