import { google } from 'googleapis';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { getMockIntegrationConfig } from '../../test/config';
import { Client, withErrorHandling } from './client';
import { parseServiceAccountKeyFile } from '../utils/parseServiceAccountKeyFile';
import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '..';

describe('#getAuthenticatedServiceClient', () => {
  let googleAuthSpy: jest.SpyInstance<
    GoogleAuth,
    [(GoogleAuthOptions | undefined)?]
  >;

  beforeEach(() => {
    googleAuthSpy = jest.spyOn(google.auth, 'GoogleAuth');
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

    const client = new Client({ config: instanceConfig });

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
        const handledFunction = withErrorHandling(executionHandler);
        await expect(handledFunction()).rejects.toThrow(J1Error);
      });
    },
  );

  test('should handle errors of unknown format', async () => {
    const mockUnknownError = new Error() as any;
    const executionHandler = jest.fn().mockRejectedValue(mockUnknownError);
    const handledFunction = withErrorHandling(executionHandler);
    await expect(handledFunction()).rejects.toThrow(
      IntegrationProviderAPIError,
    );
  });

  test('should throw an IntegrationProviderAPIError on all unknown errors', async () => {
    const executionHandler = jest
      .fn()
      .mockRejectedValue(new Error('Something esploded'));

    const onRetry = jest.fn();
    const handledFunction = withErrorHandling(executionHandler, { onRetry });

    await expect(handledFunction()).rejects.toThrow(
      IntegrationProviderAPIError,
    );

    expect(onRetry).toHaveBeenCalledTimes(0);
  });

  test('should pass parameters to the wrapped function return the result if no errors', async () => {
    const executionHandler = jest
      .fn()
      .mockImplementation((...params) => Promise.resolve(params));
    const handledFunction = withErrorHandling(executionHandler);
    await expect(handledFunction('param1', 'param2')).resolves.toEqual([
      'param1',
      'param2',
    ]);
  });

  test('should retry if quota error received with 403 status code', async () => {
    const err = new Error(
      "Error: Quota exceeded for quota group 'ListGroup' and limit 'List requests per 100 seconds' of service 'compute.googleapis.com' for consumer 'project_number:12345'.",
    );
    (err as any).response = { status: 403 };

    const executionHandler = jest
      .fn()
      .mockRejectedValueOnce(err)
      .mockImplementationOnce((...params) => Promise.resolve(params));

    const onRetry = jest.fn();
    const handledFunction = withErrorHandling(executionHandler, { onRetry });

    await expect(handledFunction('param1', 'param2')).resolves.toEqual([
      'param1',
      'param2',
    ]);

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(err);
  });

  test('should retry if throttling error received with 429 status code', async () => {
    const err = new Error('Error: Too Many Requests');
    (err as any).response = { status: 429 };

    const executionHandler = jest
      .fn()
      .mockRejectedValueOnce(err)
      .mockImplementationOnce((...params) => Promise.resolve(params));

    const onRetry = jest.fn();
    const handledFunction = withErrorHandling(executionHandler, { onRetry });

    await expect(handledFunction('param1', 'param2')).resolves.toEqual([
      'param1',
      'param2',
    ]);

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(err);
  });
});

describe('Client', () => {
  test('should set projectId to the config projectId if provided', () => {
    const configProjectId = 'projectId';
    const serviceAccountProjectId = 'serviceAccountProjectId';
    const config = {
      projectId: configProjectId,
      serviceAccountKeyConfig: { project_id: serviceAccountProjectId },
    } as unknown as IntegrationConfig;
    expect(new Client({ config }).projectId).toBe(configProjectId);
  });

  test('should set projectId to the service account projectId if the configprojectId is not provided', () => {
    const configProjectId = undefined;
    const serviceAccountProjectId = 'serviceAccountProjectId';
    const config = {
      projectId: configProjectId,
      serviceAccountKeyConfig: { project_id: serviceAccountProjectId },
    } as unknown as IntegrationConfig;
    expect(new Client({ config }).projectId).toBe(serviceAccountProjectId);
  });

  test('should set projectId to the projectId override option reguardless on if the service account projectId and config projectIds are provided or not', () => {
    const configProjectId = 'projectId';
    const serviceAccountProjectId = 'serviceAccountProjectId';
    const overrideProjectId = 'overrideProjectId';
    const config = {
      projectId: configProjectId,
      serviceAccountKeyConfig: { project_id: serviceAccountProjectId },
    } as unknown as IntegrationConfig;
    expect(new Client({ config, projectId: overrideProjectId }).projectId).toBe(
      overrideProjectId,
    );
  });
});
