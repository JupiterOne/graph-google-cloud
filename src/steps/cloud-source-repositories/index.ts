import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { fetchCloudSourceRepositoriesStep } from './steps/fetch-cloud-source-repositories';

export const cloudSourceRepositoriesSteps: IntegrationStep<IntegrationConfig>[] =
  [fetchCloudSourceRepositoriesStep];
