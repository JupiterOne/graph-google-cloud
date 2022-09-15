import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../types';
import { buildCloudBuildTriggerTriggersBuildRelationshipsStep } from './steps/build-cloud-build-trigger-triggers-build-relationships';
import { fetchCloudBuildBitbucketServerConfigStep } from './steps/fetch-cloud-build-bb-configs';
import { fetchCloudBuildBitbucketRepositoriesStep } from './steps/fetch-cloud-build-bb-repos';
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
  fetchCloudBuildBitbucketRepositoriesStep,

  buildCloudBuildTriggerTriggersBuildRelationshipsStep,
];
