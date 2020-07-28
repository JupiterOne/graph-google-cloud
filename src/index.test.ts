import { invocationConfig } from './index';
import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from './types';
import { google } from 'googleapis';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import {
  IntegrationValidationError,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import { getMockIntegrationConfig } from '../test/config';
import { setupGoogleCloudRecording } from '../test/recording';
import { integrationConfig } from '../test/config';
import getStepStartStates from './getStepStartStates';
import { STEP_CLOUD_FUNCTIONS } from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';

async function validateInvocationInvalidConfigTest(
  instanceConfig?: Partial<IntegrationConfig>,
) {
  const context = createMockExecutionContext<IntegrationConfig>(
    instanceConfig
      ? {
          instanceConfig: instanceConfig as IntegrationConfig,
        }
      : undefined,
  );

  const { getStepStartStates } = invocationConfig;

  if (!getStepStartStates) {
    throw new Error('Missing "getStepStartStates" in index');
  }

  let failed = false;

  try {
    await getStepStartStates(context);
  } catch (err) {
    expect(err instanceof IntegrationValidationError).toBe(true);
    expect(err.message).toEqual(
      'Missing a required integration config value {clientEmail, privateKey, projectId}',
    );
    failed = true;
  }

  expect(failed).toEqual(true);
}

describe('#getStepStartStates success', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'getStepStartStates',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should return all enabled services', async () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    const stepStartStates = await getStepStartStates(context);
    const expectedStepStartStates: StepStartStates = {
      [STEP_CLOUD_FUNCTIONS]: {
        disabled: false,
      },
      [STEP_CLOUD_STORAGE_BUCKETS]: {
        disabled: false,
      },
    };

    expect(stepStartStates).toEqual(expectedStepStartStates);
  });
});

describe('#getStepStartStates failures', () => {
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

  test('should throw if call to GoogleAuth.prototype.getClient rejects', async () => {
    const mockGetClient = jest
      .fn()
      .mockRejectedValueOnce(new Error('expected error'));

    const mockGetAccessToken = jest
      .fn()
      .mockRejectedValueOnce(new Error('should not call!'));

    const mockGoogleAuthClient = ({
      getClient: mockGetClient,
      getAccessToken: mockGetAccessToken,
    } as unknown) as GoogleAuth;

    googleAuthSpy.mockReturnValueOnce(mockGoogleAuthClient);

    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: getMockIntegrationConfig(),
    });

    const { getStepStartStates } = invocationConfig;

    if (!getStepStartStates) {
      throw new Error('Missing "getStepStartStates" in index');
    }

    let failed = false;

    try {
      await getStepStartStates(context);
    } catch (err) {
      expect(err instanceof IntegrationValidationError).toBe(true);
      expect(err.message).toEqual(
        'Failed to fetch enabled service names. Ability to list services is required to run the Google Cloud integration. (error=expected error)',
      );
      failed = true;
    }

    expect(failed).toEqual(true);

    const expectedGoogleAuthCallOptions: GoogleAuthOptions = {
      credentials: {
        client_email: context.instance.config.clientEmail,
        private_key: context.instance.config.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    };

    expect(googleAuthSpy).toHaveBeenCalledTimes(1);
    expect(googleAuthSpy).toHaveBeenLastCalledWith(
      expectedGoogleAuthCallOptions,
    );
    expect(mockGetClient).toHaveBeenCalledTimes(1);
    expect(mockGetAccessToken).toHaveBeenCalledTimes(0);
  });

  test('should throw if call to GoogleAuth.prototype.getAccessToken rejects', async () => {
    const mockGetAccessToken = jest
      .fn()
      .mockRejectedValueOnce(new Error('expected error'));

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

    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: getMockIntegrationConfig(),
    });

    const { getStepStartStates } = invocationConfig;

    if (!getStepStartStates) {
      throw new Error('Missing "getStepStartStates" in index');
    }

    let failed = false;

    try {
      await getStepStartStates(context);
    } catch (err) {
      expect(err instanceof IntegrationValidationError).toBe(true);
      expect(err.message).toEqual(
        'Failed to fetch enabled service names. Ability to list services is required to run the Google Cloud integration. (error=expected error)',
      );
      failed = true;
    }

    expect(failed).toEqual(true);

    const expectedGoogleAuthCallOptions: GoogleAuthOptions = {
      credentials: {
        client_email: context.instance.config.clientEmail,
        private_key: context.instance.config.privateKey,
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

  test('should throw if missing clientEmail property', async () => {
    await validateInvocationInvalidConfigTest();
    expect(googleAuthSpy.mock.calls.length).toEqual(0);
  });

  test('should throw if missing privateKey property', async () => {
    await validateInvocationInvalidConfigTest({
      clientEmail: 'google-cloud-client-email',
    });
    expect(googleAuthSpy.mock.calls.length).toEqual(0);
  });

  test('should throw if missing projectId property', async () => {
    await validateInvocationInvalidConfigTest({
      clientEmail: 'google-cloud-client-email',
      privateKey: 'google-cloud-private-key',
    });
    expect(googleAuthSpy.mock.calls.length).toEqual(0);
  });
});
