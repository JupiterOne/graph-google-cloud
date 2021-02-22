import { google, binaryauthorization_v1 } from 'googleapis';
import { Client } from '../../google-cloud/client';

type PolicyResponse = {
  data: binaryauthorization_v1.Schema$Policy;
};

export class BinaryAuthorizationClient extends Client {
  private client = google.binaryauthorization('v1');

  async fetchPolicy(): Promise<binaryauthorization_v1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();

    const result: PolicyResponse = await this.client.projects.getPolicy({
      auth,
      name: `projects/${this.projectId}/policy`,
    });

    return result.data;
  }
}
