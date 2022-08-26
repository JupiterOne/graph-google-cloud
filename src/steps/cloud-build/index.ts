import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { fetchCloudBuildTriggerStep } from './steps/fetch-cloud-build-triggers';
import { fetchCloudBuildStep } from './steps/fetch-cloud-builds';

export const cloudBuildSteps: IntegrationStep<IntegrationConfig>[] = [
  fetchCloudBuildStep,
  fetchCloudBuildTriggerStep,
];
