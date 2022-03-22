import { Client } from '../../google-cloud/client';
import { google, pubsub_v1 } from 'googleapis';

export class PubSubClient extends Client {
  private client = google.pubsub({ version: 'v1', retry: false });

  async getPolicy(topicPath: string): Promise<pubsub_v1.Schema$Policy> {
    const auth = await this.getAuthenticatedServiceClient();
    const topicName = topicPath.split('/')[3];

    const response = await this.client.projects.topics.getIamPolicy({
      resource: `projects/${this.projectId}/topics/${topicName}`,
      auth,
    });

    return response.data;
  }

  async iterateProjectTopics(
    callback: (data: pubsub_v1.Schema$Topic) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.topics.list({
          auth,
          project: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: pubsub_v1.Schema$ListTopicsResponse) => {
        for (const topic of data.topics || []) {
          await callback(topic);
        }
      },
    );
  }

  async iterateProjectSubscriptions(
    callback: (data: pubsub_v1.Schema$Subscription) => Promise<void>,
  ): Promise<void> {
    const auth = await this.getAuthenticatedServiceClient();

    await this.iterateApi(
      async (nextPageToken) => {
        return this.client.projects.subscriptions.list({
          auth,
          project: `projects/${this.projectId}`,
          pageToken: nextPageToken,
        });
      },
      async (data: pubsub_v1.Schema$ListSubscriptionsResponse) => {
        for (const subscription of data.subscriptions || []) {
          await callback(subscription);
        }
      },
    );
  }
}
