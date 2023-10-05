import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { AuthClient, GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { google } from 'googleapis';
import { IntegrationConfig, invocationConfig } from '..';
import { getMockIntegrationConfig, integrationConfig } from '../../test/config';
import {
  withGoogleCloudRecording,
  getMatchRequestsBy,
} from '../../test/recording';
import { parseServiceAccountKeyFile } from '../utils/parseServiceAccountKeyFile';
import { Client } from './client';
import { getMockLogger } from '../../test/helpers/getMockLogger';

describe('#getAuthenticatedServiceClient', () => {
  let googleAuthSpy: jest.SpyInstance<
    GoogleAuth<AuthClient>,
    [opts?: GoogleAuthOptions<AuthClient>]
  >;

  beforeEach(() => {
    googleAuthSpy = jest.spyOn(
      google.auth,
      'GoogleAuth',
    ) as unknown as jest.SpyInstance<
      GoogleAuth<AuthClient>,
      [opts?: GoogleAuthOptions<AuthClient>]
    >;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should cache authenticated service client BaseExternalAccountClient data', async () => {
    const instanceConfig = getMockIntegrationConfig();

    const mockGetAccessToken = jest
      .fn()
      .mockResolvedValueOnce(Promise.resolve());
    const mockGetClient = jest.fn().mockResolvedValueOnce(
      Promise.resolve({
        getAccessToken: mockGetAccessToken,
      }),
    );

    const mockGoogleAuthClient = {
      getClient: mockGetClient,
      getAccessToken: mockGetAccessToken,
    } as unknown as GoogleAuth;

    googleAuthSpy.mockReturnValueOnce(mockGoogleAuthClient);

    const logger = getMockLogger<IntegrationLogger>();

    const client = new Client({ config: instanceConfig }, logger);

    const auth = await client.getAuthenticatedServiceClient();
    const auth2 = await client.getAuthenticatedServiceClient();

    expect(auth).toBe(auth2);

    const parsedServiceAccountKey = parseServiceAccountKeyFile(
      instanceConfig.serviceAccountKeyFile,
    );

    const expectedGoogleAuthCallOptions: GoogleAuthOptions = {
      credentials: {
        client_email: parsedServiceAccountKey.client_email,
        private_key: parsedServiceAccountKey.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    };

    expect(googleAuthSpy).toHaveBeenCalledTimes(1);
    expect(googleAuthSpy).toHaveBeenLastCalledWith(
      expectedGoogleAuthCallOptions,
    );
    expect(mockGetClient).toHaveBeenCalledTimes(1);
    expect(mockGetClient).toHaveBeenCalledWith();
    expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
    expect(mockGetAccessToken).toHaveBeenCalledWith();
  });
});

describe('withErrorHandling', () => {
  // Specific error handling for this method is tested in the index.test.ts files where the errors were seen. Ex: src/steps/compute/index.test.ts

  const config = {
    projectId: 'projectId',
    serviceAccountKeyConfig: { project_id: 'serviceAccountProjectId' },
  } as unknown as IntegrationConfig;

  let client;
  let onRetry;

  const logger = getMockLogger<IntegrationLogger>();

  beforeEach(() => {
    onRetry = jest.fn();
    client = new Client({ config, onRetry: onRetry }, logger);
  });

  [IntegrationProviderAuthorizationError, IntegrationProviderAPIError].forEach(
    (J1Error) => {
      test('should forward on errors that have already been handled', async () => {
        const mockForbiddenError = new J1Error({
          endpoint: 'test endpoint',
          status: 999,
          statusText: 'test',
        }) as any;
        const executionHandler = jest
          .fn()
          .mockRejectedValue(mockForbiddenError);
        const handledFunction = client.withErrorHandling(executionHandler);
        await expect(handledFunction).rejects.toThrow(J1Error);
      });
    },
  );

  test('should handle errors of unknown format', async () => {
    const mockUnknownError = new Error() as any;
    const executionHandler = jest.fn().mockRejectedValue(mockUnknownError);
    const handledFunction = client.withErrorHandling(executionHandler);
    await expect(handledFunction).rejects.toThrow(IntegrationProviderAPIError);
  });

  test('should throw an IntegrationProviderAPIError on all unknown errors', async () => {
    const executionHandler = jest
      .fn()
      .mockRejectedValue(new Error('Something esploded'));

    const handledFunction = client.withErrorHandling(executionHandler);

    await expect(handledFunction).rejects.toThrow(IntegrationProviderAPIError);

    expect(onRetry).toHaveBeenCalledTimes(0);
  });

  test('should pass parameters to the wrapped function return the result if no errors', async () => {
    const executionHandler = jest
      .fn()
      .mockImplementation(() => Promise.resolve(['param1', 'param2']));
    const response = await client.withErrorHandling(executionHandler);
    expect(response).toEqual(['param1', 'param2']);
  });

  test('should retry if quota error received with 403 status code', async () => {
    const err = new Error(
      "Error: Quota exceeded for quota group 'ListGroup' and limit 'List requests per 100 seconds' of service 'compute.googleapis.com' for consumer 'project_number:12345'.",
    );
    (err as any).response = { status: 403 };

    const executionHandler = jest
      .fn()
      .mockRejectedValueOnce(err)
      .mockImplementationOnce(() => Promise.resolve(['param1', 'param2']));

    const response = await client.withErrorHandling(executionHandler);

    expect(response).toEqual(['param1', 'param2']);

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(err);
  });

  test('should retry if throttling error received with 429 status code', async () => {
    const err = new Error('Error: Too Many Requests');
    (err as any).response = { status: 429 };

    const executionHandler = jest
      .fn()
      .mockRejectedValueOnce(err)
      .mockImplementationOnce(() => Promise.resolve(['param1', 'param2']));

    const response = await client.withErrorHandling(executionHandler);

    expect(response).toEqual(['param1', 'param2']);

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(err);
  });
});

describe('Client', () => {
  const logger = getMockLogger<IntegrationLogger>();

  test('should set projectId to the config projectId if provided', () => {
    const configProjectId = 'projectId';
    const serviceAccountProjectId = 'serviceAccountProjectId';
    const config = {
      projectId: configProjectId,
      serviceAccountKeyConfig: { project_id: serviceAccountProjectId },
    } as unknown as IntegrationConfig;
    expect(new Client({ config }, logger).projectId).toBe(configProjectId);
  });

  test('should set projectId to the service account projectId if the configprojectId is not provided', () => {
    const configProjectId = undefined;
    const serviceAccountProjectId = 'serviceAccountProjectId';
    const config = {
      projectId: configProjectId,
      serviceAccountKeyConfig: { project_id: serviceAccountProjectId },
    } as unknown as IntegrationConfig;
    expect(new Client({ config }, logger).projectId).toBe(
      serviceAccountProjectId,
    );
  });

  test('should set projectId to the projectId override option reguardless on if the service account projectId and config projectIds are provided or not', () => {
    const configProjectId = 'projectId';
    const serviceAccountProjectId = 'serviceAccountProjectId';
    const overrideProjectId = 'overrideProjectId';
    const config = {
      projectId: configProjectId,
      serviceAccountKeyConfig: { project_id: serviceAccountProjectId },
    } as unknown as IntegrationConfig;
    expect(
      new Client({ config, projectId: overrideProjectId }, logger).projectId,
    ).toBe(overrideProjectId);
  });
});

describe('Client - getAuthenticatedServiceClient tests', () => {
  test('When service account key file is complete but with an incorrect client_email or service account is disabled, error should be instance of IntegrationProviderAuthenticationError and thorow a specific message.', async () => {
    await withGoogleCloudRecording(
      {
        directory: __dirname,
        name: 'validateInvocation:failure:accountNotFound',
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
        expect(error.message).toEqual(
          'Provider API failed at https://www.googleapis.com/oauth2/v4/token: 400 invalid_grant: Invalid grant: account not found',
        );
        expect(error).toBeInstanceOf(IntegrationProviderAPIError);
      },
    );
  });

  test('When service account key file is complete but service account key was deleted from Google Cloud or expired, error should be instance of IntegrationProviderAuthenticationError and thorow a specific message.', async () => {
    await withGoogleCloudRecording(
      {
        directory: __dirname,
        name: 'validateInvocation:failure:invalidJWT',
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
        expect(error.message).toEqual(
          'Provider API failed at https://www.googleapis.com/oauth2/v4/token: 400 invalid_grant: Invalid JWT Signature.',
        );
        expect(error).toBeInstanceOf(IntegrationProviderAPIError);
      },
    );
  });
});
