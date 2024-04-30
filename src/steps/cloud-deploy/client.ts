import { clouddeploy_v1, google } from 'googleapis';
import { Client } from '../../google-cloud/client';
import { iterateRegions } from '../../google-cloud/regions';
import {
  CloudDeployPermissions,
  STEP_CLOUD_DEPLOY_AUTOMATION,
  STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
} from './constant';

export class CloudDeployClient extends Client {
  private client = google.clouddeploy({ version: 'v1', retry: false });

  async iterateCloudDeployDeliveryPipelines(
    callback: (
      data: clouddeploy_v1.Schema$DeliveryPipeline,
      region,
    ) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await iterateRegions(async (region) => {
      await this.iterateApi(
        async (nextPageToken) => {
          return this.client.projects.locations.deliveryPipelines.list({
            auth,
            pageToken: nextPageToken,
            parent: `projects/${this.projectId}/locations/${region}`,
          });
        },
        async (data: clouddeploy_v1.Schema$ListDeliveryPipelinesResponse) => {
          for (const item of data.deliveryPipelines || []) {
            await callback(item, region);
          }
        },
        STEP_CLOUD_DEPLOY_DELIVERY_PIPELINE,
        CloudDeployPermissions.STEP_CLOUD_DEPLOY_DELIVERY_PIPELINES,
      );
    });
  }

  async iterateCloudDeployAutomation(
    deliveryPipelineName,
    region,
    callback: (data: clouddeploy_v1.Schema$Automation) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();
    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.locations.deliveryPipelines.automations.list(
          {
            auth,
            pageToken: nextPageToken,
            parent: `projects/${this.projectId}/locations/${region}/deliveryPipelines/${deliveryPipelineName}`,
          },
        );
      },
      async (data: clouddeploy_v1.Schema$ListAutomationsResponse) => {
        for (const item of data.automations || []) {
          await callback(item);
        }
      },
      STEP_CLOUD_DEPLOY_AUTOMATION,
      CloudDeployPermissions.STEP_CLOUD_DEPLOY_AUTOMATION,
    );
  }
}
