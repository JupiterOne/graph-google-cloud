import { GoogleCloudIntegrationStep } from '../../types';
import { buildCloudBuildTriggerTriggersBuildRelationshipsStep } from './steps/build-cloud-build-trigger-triggers-build-relationships';
import { buildCloudBuildTriggerUsesGithubRepositoryStep } from './steps/build-cloud-build-trigger-uses-github-repo-relationships';
import { buildCloudBuildUsesSourceRepositoryRelationshipsStep } from './steps/build-cloud-build-uses-source-repo-relationships';
import { buildCloudBuildUsesStorageBucketRelationshipsStep } from './steps/build-cloud-build-uses-storage-bucket-relationships';
import { fetchCloudBuildBitbucketServerConfigStep } from './steps/fetch-cloud-build-bb-configs';
import { fetchCloudBuildBitbucketRepositoriesStep } from './steps/fetch-cloud-build-bb-repos';
import { fetchCloudBuildGithubEnterpriseConfigStep } from './steps/fetch-cloud-build-ghe-configs';
import { fetchCloudBuildTriggerStep } from './steps/fetch-cloud-build-triggers';
import { fetchCloudBuildWorkerPoolsStep } from './steps/fetch-cloud-build-worker-pools';
import { fetchCloudBuildStep } from './steps/fetch-cloud-builds';

export const cloudBuildSteps: GoogleCloudIntegrationStep[] = [
  fetchCloudBuildStep,
  fetchCloudBuildTriggerStep,
  fetchCloudBuildWorkerPoolsStep,
  fetchCloudBuildGithubEnterpriseConfigStep,
  fetchCloudBuildBitbucketServerConfigStep,
  fetchCloudBuildBitbucketRepositoriesStep,

  buildCloudBuildTriggerTriggersBuildRelationshipsStep,
  buildCloudBuildUsesStorageBucketRelationshipsStep,
  buildCloudBuildUsesSourceRepositoryRelationshipsStep,
  buildCloudBuildTriggerUsesGithubRepositoryStep,
];
