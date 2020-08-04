import { google } from 'googleapis';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { getMockIntegrationConfig } from '../../test/config';
import { Client } from './client';
import { parseServiceAccountKeyFile } from '../utils/parseServiceAccountKeyFile';

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
