import { GoogleCloudIntegrationStep } from '../../types';
import { buildCloudDeployAutomationDeliveryPipelineRelationshipStep } from './steps/build-cloud-deploy-delivery-pipeline-automation-relationship';
import { buildCloudDeployDeliveryPipelineStorageBucketRelationshipStep } from './steps/build-cloud-deploy-delivery-pipeline-storage-bucket-relationship';
import { buildCloudDeployPipelinesUsesGithubRepositoryStep } from './steps/build-cloud-deploy-delivery-pipeline-github-relationship';
import { buildProjectCloudDeployRelationshipStep } from './steps/build-cloud-deploy-project-relationship';
import { builCloudDeployServiceDeliveryPipelineRelationshipStep } from './steps/build-cloud-deploy-service-delivery-pipeline-relationship';
import { fetchCloudDeployServiceStep } from './steps/cloud-deploy-service';
import { fetchCloudDeployAutomationsStep } from './steps/fetch-automations';
import { fetchCloudDeployDeliveryPipelinesStep } from './steps/fetch-delivery-pipeline';

export const CloudDeploySteps: GoogleCloudIntegrationStep[] = [
  fetchCloudDeployDeliveryPipelinesStep,
  fetchCloudDeployAutomationsStep,
  fetchCloudDeployServiceStep,
  buildProjectCloudDeployRelationshipStep,
  builCloudDeployServiceDeliveryPipelineRelationshipStep,
  buildCloudDeployAutomationDeliveryPipelineRelationshipStep,
  buildCloudDeployPipelinesUsesGithubRepositoryStep,
  buildCloudDeployDeliveryPipelineStorageBucketRelationshipStep,
];
