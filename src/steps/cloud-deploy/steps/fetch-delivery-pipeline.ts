import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../../types';
import { CloudDeployClient } from '../client';
import {
  Entities,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
} from '../constant';
import { IngestionSources, CloudDeployPermissions } from '../constant';
import { createDeliveryPipelineEntity } from '../converter';

export async function fetchCloudDeployDeliveryPipeline(
  context: IntegrationStepContext,
): Promise<void> {
  const { jobState, logger } = context;
  const client = new CloudDeployClient(
    {
      config: context.instance.config,
    },
    logger,
  );

  await client.iterateCloudDeployDeliveryPipelines(
    async (deliveryPipeline, region) => {
      await jobState.addEntity(
        createDeliveryPipelineEntity(
          deliveryPipeline,
          client.projectId,
          region,
        ),
      );
    },
  );
}

export const fetchCloudDeployDeliveryPipelinesStep: GoogleCloudIntegrationStep =
  {
    id: STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
    ingestionSourceId: IngestionSources.CLOUD_DEPLOY_DELIVERY_PIPELINES,
    name: 'Cloud Deploy Delivery Pipeline',
    entities: [Entities.CLOUD_DEPLOY_DELIVERY_PIPELINE],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchCloudDeployDeliveryPipeline,
    permissions: CloudDeployPermissions.STEP_CLOUD_DEPLOY_DELIVERY_PIPELINES,
    apis: ['clouddeploy.googleapis.com'],
  };
