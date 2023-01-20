import { IntegrationProviderAuthorizationError } from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import {
  DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
  integrationConfig,
} from '../test/config';
import {
  withGoogleCloudRecording,
  getMatchRequestsBy,
} from '../test/recording';
import { invocationConfig } from './index';
import { IntegrationConfig } from './types';

describe('#config - validateInvocation tests', () => {
  ['project_id', 'private_key', 'client_email'].forEach((k) => {
    test(`#config - validateInvocation tests: should throw if missing "${k}" from serviceAccountKeyFile.`, async () => {
      await expect(
        invocationConfig.validateInvocation?.(
          createMockExecutionContext({
            instanceConfig: {
              serviceAccountKeyFile: JSON.stringify({
                ...DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
                [k]: undefined,
              }),
            } as IntegrationConfig,
          }),
        ),
      ).rejects.toThrow(
        `Invalid contents of "serviceAccountKeyFile" passed to integration (invalidFileKeys=${k})` ||
          'Missing a required integration config value {serviceAccountKeyFile}',
      );
    });
  });

  test('#config - validateInvocation tests: should be successful with the correct credentials.', async () => {
    await withGoogleCloudRecording(
      {
        directory: __dirname,
        name: 'validateInvocation:success',
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      },
      async () => {
        await expect(
          invocationConfig.validateInvocation?.(
            createMockExecutionContext({
              instanceConfig: integrationConfig,
            }),
          ),
        ).resolves.toBeUndefined();
      },
    );
  });

  test('When service account key file is complete and not expired but project id is incorrect, error should be instance of IntegrationProviderAuthenticationError and thorow a specific message.', async () => {
    await withGoogleCloudRecording(
      {
        directory: __dirname,
        name: 'validateInvocation:failure:invalidProjectId',
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
          recordFailedRequests: true,
        },
      },
      async () => {
        let error;
        try {
          await invocationConfig.validateInvocation?.(
            createMockExecutionContext({
              instanceConfig: integrationConfig,
            }),
          );
        } catch (err) {
          error = err;
        }
        expect(error).not.toBeUndefined();
        expect(error.message).toContain(
          "Provider authorization failed at https://serviceusage.googleapis.com/v1/projects/j1-gc-integration-dev-v2/services?pageSize=200&filter=state%3AENABLED: 403 Project 'j1-gc-integration-dev-v312' not found or permission denied",
        );
        expect(error).toBeInstanceOf(IntegrationProviderAuthorizationError);
      },
    );
  });
});
