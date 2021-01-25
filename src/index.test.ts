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
import {
  integrationConfig,
  DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
} from '../test/config';
import getStepStartStates from './getStepStartStates';
import { STEP_CLOUD_FUNCTIONS } from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';
import { STEP_API_SERVICES } from './steps/service-usage';
import { parseServiceAccountKeyFile } from './utils/parseServiceAccountKeyFile';
import { STEP_IAM_ROLES, STEP_IAM_SERVICE_ACCOUNTS } from './steps/iam';
import {
  STEP_RESOURCE_MANAGER_IAM_POLICY,
  STEP_PROJECT,
} from './steps/resource-manager';
import {
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_FIREWALLS,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_SUBNETWORKS,
} from './steps/compute';
import { STEP_CLOUD_KMS_KEYS, STEP_CLOUD_KMS_KEY_RINGS } from './steps/kms';
import { STEP_CLOUD_SQL_ADMIN_INSTANCES } from './steps/sql-admin';
import { STEP_BIG_QUERY_DATASETS } from './steps/big-query';

interface ValidateInvocationInvalidConfigTestParams {
  instanceConfig?: Partial<IntegrationConfig>;
  expectedErrorMessage?: string;
}

async function validateInvocationInvalidConfigTest({
  instanceConfig,
  expectedErrorMessage,
}: ValidateInvocationInvalidConfigTestParams = {}) {
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
      expectedErrorMessage ||
        'Missing a required integration config value {serviceAccountKeyFile}',
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
      [STEP_PROJECT]: {
        disabled: false,
      },
      [STEP_API_SERVICES]: {
        disabled: false,
      },
      [STEP_CLOUD_FUNCTIONS]: {
        disabled: false,
      },
      [STEP_CLOUD_STORAGE_BUCKETS]: {
        disabled: false,
      },
      [STEP_IAM_ROLES]: {
        disabled: false,
      },
      [STEP_IAM_SERVICE_ACCOUNTS]: {
        disabled: false,
      },
      [STEP_RESOURCE_MANAGER_IAM_POLICY]: {
        disabled: false,
      },
      [STEP_COMPUTE_DISKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_INSTANCES]: {
        disabled: false,
      },
      [STEP_COMPUTE_NETWORKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_SUBNETWORKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_FIREWALLS]: {
        disabled: false,
      },
      [STEP_CLOUD_KMS_KEY_RINGS]: {
        disabled: false,
      },
      [STEP_CLOUD_KMS_KEYS]: {
        disabled: false,
      },
      [STEP_CLOUD_SQL_ADMIN_INSTANCES]: {
        disabled: false,
      },
      [STEP_BIG_QUERY_DATASETS]: {
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

    const parsedServiceAccountKey = parseServiceAccountKeyFile(
      context.instance.config.serviceAccountKeyFile,
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

    const parsedServiceAccountKey = parseServiceAccountKeyFile(
      context.instance.config.serviceAccountKeyFile,
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

  test('should throw if missing serviceAccountKeyFile property in config', async () => {
    await validateInvocationInvalidConfigTest();
    expect(googleAuthSpy.mock.calls.length).toEqual(0);
  });

  [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri',
    'auth_provider_x509_cert_url',
    'client_x509_cert_url',
  ].forEach((k) => {
    test(`should throw if missing "${k}" from serviceAccountKeyFile`, async () => {
      await validateInvocationInvalidConfigTest({
        instanceConfig: {
          serviceAccountKeyFile: JSON.stringify({
            ...DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
            [k]: undefined,
          }),
        },
        expectedErrorMessage: `Invalid contents of "serviceAccountKeyFile" passed to integration (invalidFileKeys=${k})`,
      });

      expect(googleAuthSpy.mock.calls.length).toEqual(0);
    });
  });
});
