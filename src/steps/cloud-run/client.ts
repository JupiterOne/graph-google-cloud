import { google, run_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  CloudRunPermissions,
  STEP_CLOUD_RUN_CONFIGURATIONS,
  STEP_CLOUD_RUN_ROUTES,
  STEP_CLOUD_RUN_SERVICES,
} from './constants';

export class CloudRunClient extends Client {
  private client = google.run({ version: 'v1', retry: false });

  async iterateCloudRunServices(
    callback: (data: run_v1.Schema$Service) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    const response = await this.withErrorHandling(
      async () =>
        this.client.namespaces.services.list({
          parent: `namespaces/${this.projectId}`,
          auth,
        }),
      this.logger,
      {
        stepId: STEP_CLOUD_RUN_SERVICES,
        suggestedPermissions: CloudRunPermissions.STEP_CLOUD_RUN_SERVICES,
      },
    );

    for (const service of response?.data.items || []) {
      await callback(service);
    }
  }

  async iterateCloudRunRoutes(
    callback: (data: run_v1.Schema$Route) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    const response = await this.withErrorHandling(
      async () =>
        await this.client.namespaces.routes.list({
          parent: `namespaces/${this.projectId}`,
          auth,
        }),
      this.logger,
      {
        stepId: STEP_CLOUD_RUN_ROUTES,
        suggestedPermissions: CloudRunPermissions.STEP_CLOUD_RUN_ROUTES,
      },
    );

    for (const route of response?.data.items || []) {
      await callback(route);
    }
  }

  async iterateCloudRunConfigurations(
    callback: (data: run_v1.Schema$Configuration) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    const response = await this.withErrorHandling(
      async () =>
        await this.client.namespaces.configurations.list({
          parent: `namespaces/${this.projectId}`,
          auth,
        }),
      this.logger,
      {
        stepId: STEP_CLOUD_RUN_CONFIGURATIONS,
        suggestedPermissions: CloudRunPermissions.STEP_CLOUD_RUN_CONFIGURATIONS,
      },
    );

    for (const configuration of response?.data.items || []) {
      await callback(configuration);
    }
  }
}
