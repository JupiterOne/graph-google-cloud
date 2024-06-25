import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudDeployClient } from '../client';
import {
  ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE,
  Entities,
  STEP_CLOUD_DEPLOY_AUTOMATION,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
} from '../constant';
import { IngestionSources, CloudDeployPermissions } from '../constant';
import { createCloudDeployAutomationEntity } from '../converter';

export async function fetchCloudDeployAutomations(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new CloudDeployClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await jobState.iterateEntities(
    { _type: ENTITY_TYPE_CLOUD_DEPLOY_DELIVERY_PIPELINE },
    async (deployPipeline) => {
      const deployPipelineName = deployPipeline.displayName as string;
      const region = deployPipeline.region as string;

      if (!deployPipelineName || !region) return;

      await client.iterateCloudDeployAutomation(
        deployPipelineName,
        region,
        async (automation) => {
          await jobState.addEntity(
            createCloudDeployAutomationEntity(
              automation,
              client.projectId,
              region,
              deployPipeline.uid,
            ),
          );
        },
      );
    },
  );
}

export const fetchCloudDeployAutomationsStep: GoogleCloudIntegrationStep = {
  id: STEP_CLOUD_DEPLOY_AUTOMATION,
  ingestionSourceId: IngestionSources.CLOUD_DEPLOY_AUTOMATION,
  name: 'Cloud Deploy Automation',
  entities: [
   Entities.CLOUD_DEPLOY_AUTOMATION
  ],
  relationships: [],
  dependsOn: [STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE],
  executionHandler: fetchCloudDeployAutomations,
  permissions: CloudDeployPermissions.STEP_CLOUD_DEPLOY_AUTOMATION,
  apis: ['clouddeploy.googleapis.com'],
};
