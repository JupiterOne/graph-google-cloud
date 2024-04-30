import { google, binaryauthorization_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';
import {
  BinaryAuthPermissions,
  STEP_BINARY_AUTHORIZATION_POLICY,
} from './constants';

type PolicyResponse = {
  data: binaryauthorization_v1.Schema$Policy;
};

export class BinaryAuthorizationClient extends Client {
  private client = google.binaryauthorization({ version: 'v1', retry: false });

  async fetchPolicy(): Promise<
    binaryauthorization_v1.Schema$Policy | undefined
  > {
    const auth = await this.getAuthenticatedServiceClient();

    const result: PolicyResponse | undefined = await this.withErrorHandling(
      () =>
        this.client.projects.getPolicy({
          auth,
          name: `projects/${this.projectId}/policy`,
        }),
      this.logger,
      {
        stepId: STEP_BINARY_AUTHORIZATION_POLICY,
        suggestedPermissions:
          BinaryAuthPermissions.STEP_BINARY_AUTHORIZATION_POLICY,
      },
    );

    return result?.data;
  }
}
