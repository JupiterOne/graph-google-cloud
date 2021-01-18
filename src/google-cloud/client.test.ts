import { google } from 'googleapis';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { getMockIntegrationConfig } from '../../test/config';
import { Client, withErrorHandling } from './client';
import { parseServiceAccountKeyFile } from '../utils/parseServiceAccountKeyFile';
import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';

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

  test('should cache authenticated service client GoogleClientAuth data', async () => {
    const instanceConfig = getMockIntegrationConfig();

    const mockGetAccessToken = jest
      .fn()
      .mockResolvedValueOnce(Promise.resolve());
    const mockGetClient = jest.fn().mockResolvedValueOnce(
      Promise.resolve({
        getAccessToken: mockGetAccessToken,
      }),
    );

    const mockGoogleAuthClient = ({
      getClient: mockGetClient,
      getAccessToken: mockGetAccessToken,
    } as unknown) as GoogleAuth;

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
    const handledFunction = withErrorHandling(executionHandler);
    await expect(handledFunction()).rejects.toThrow(
      IntegrationProviderAPIError,
    );
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
});
