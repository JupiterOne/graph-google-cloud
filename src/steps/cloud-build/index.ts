import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { fetchCloudBuildBitbucketServerConfigStep } from './steps/fetch-cloud-build-bb-configs';
import { fetchCloudBuildGithubEnterpriseConfigStep } from './steps/fetch-cloud-build-ghe-configs';
import { fetchCloudBuildTriggerStep } from './steps/fetch-cloud-build-triggers';
import { fetchCloudBuildWorkerPoolsStep } from './steps/fetch-cloud-build-worker-pools';
import { fetchCloudBuildStep } from './steps/fetch-cloud-builds';

export const cloudBuildSteps: IntegrationStep<IntegrationConfig>[] = [
  fetchCloudBuildStep,
  fetchCloudBuildTriggerStep,
  fetchCloudBuildWorkerPoolsStep,
  fetchCloudBuildGithubEnterpriseConfigStep,
  fetchCloudBuildBitbucketServerConfigStep,
];
