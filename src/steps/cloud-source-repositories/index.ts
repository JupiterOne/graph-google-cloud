import { GoogleCloudIntegrationStep } from '../../types';
import { fetchCloudSourceRepositoriesStep } from './steps/fetch-cloud-source-repositories';

export const cloudSourceRepositoriesSteps: GoogleCloudIntegrationStep[] = [
  fetchCloudSourceRepositoriesStep,
];
