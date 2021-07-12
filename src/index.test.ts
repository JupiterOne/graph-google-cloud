import { invocationConfig } from './index';
import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from './types';
import { google } from 'googleapis';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import {
  Entity,
  IntegrationValidationError,
  Step,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import { getMockIntegrationConfig } from '../test/config';
import { setupGoogleCloudRecording } from '../test/recording';
import {
  integrationConfig,
  DEFAULT_INTEGRATION_CONFIG_SERVICE_ACCOUNT_KEY_FILE,
} from '../test/config';
import getStepStartStates from './getStepStartStates';
import {
  STEP_CLOUD_FUNCTIONS,
  STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS,
} from './steps/functions';
import { STEP_CLOUD_STORAGE_BUCKETS } from './steps/storage';
import { STEP_API_SERVICES } from './steps/service-usage';
import { parseServiceAccountKeyFile } from './utils/parseServiceAccountKeyFile';
import {
  STEP_IAM_CUSTOM_ROLES,
  STEP_IAM_MANAGED_ROLES,
  STEP_IAM_SERVICE_ACCOUNTS,
} from './steps/iam';
import {
  STEP_RESOURCE_MANAGER_IAM_POLICY,
  STEP_RESOURCE_MANAGER_PROJECT,
  STEP_RESOURCE_MANAGER_ORGANIZATION,
  STEP_RESOURCE_MANAGER_FOLDERS,
  STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS,
} from './steps/resource-manager';
import {
  STEP_COMPUTE_ADDRESSES,
  STEP_COMPUTE_BACKEND_BUCKETS,
  STEP_COMPUTE_BACKEND_SERVICES,
  STEP_COMPUTE_DISKS,
  STEP_COMPUTE_FIREWALLS,
  STEP_COMPUTE_FORWARDING_RULES,
  STEP_COMPUTE_GLOBAL_ADDRESSES,
  STEP_COMPUTE_GLOBAL_FORWARDING_RULES,
  STEP_COMPUTE_HEALTH_CHECKS,
  STEP_COMPUTE_IMAGES,
  STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS,
  STEP_COMPUTE_INSTANCES,
  STEP_COMPUTE_INSTANCE_GROUPS,
  STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS,
  STEP_COMPUTE_LOADBALANCERS,
  STEP_COMPUTE_NETWORKS,
  STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS,
  STEP_COMPUTE_PROJECT,
  STEP_COMPUTE_REGION_BACKEND_SERVICES,
  STEP_COMPUTE_REGION_DISKS,
  STEP_COMPUTE_REGION_HEALTH_CHECKS,
  STEP_COMPUTE_REGION_INSTANCE_GROUPS,
  STEP_COMPUTE_REGION_LOADBALANCERS,
  STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_SNAPSHOTS,
  STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS,
  STEP_COMPUTE_SSL_POLICIES,
  STEP_COMPUTE_SUBNETWORKS,
  STEP_COMPUTE_TARGET_HTTPS_PROXIES,
  STEP_COMPUTE_TARGET_HTTP_PROXIES,
  STEP_COMPUTE_TARGET_SSL_PROXIES,
} from './steps/compute';
import { STEP_CLOUD_KMS_KEYS, STEP_CLOUD_KMS_KEY_RINGS } from './steps/kms';
import {
  STEP_BIG_QUERY_DATASETS,
  STEP_BIG_QUERY_MODELS,
  STEP_BIG_QUERY_TABLES,
} from './steps/big-query';
import { STEP_SQL_ADMIN_INSTANCES } from './steps/sql-admin';
import { STEP_DNS_MANAGED_ZONES } from './steps/dns/constants';
import { STEP_CONTAINER_CLUSTERS } from './steps/containers';
import {
  STEP_LOGGING_METRICS,
  STEP_LOGGING_PROJECT_SINKS,
} from './steps/logging/constants';
import { STEP_MONITORING_ALERT_POLICIES } from './steps/monitoring/constants';
import { STEP_BINARY_AUTHORIZATION_POLICY } from './steps/binary-authorization/constants';
import {
  STEP_PUBSUB_SUBSCRIPTIONS,
  STEP_PUBSUB_TOPICS,
} from './steps/pub-sub/constants';
import {
  STEP_APP_ENGINE_APPLICATION,
  STEP_APP_ENGINE_INSTANCES,
  STEP_APP_ENGINE_SERVICES,
  STEP_APP_ENGINE_VERSIONS,
} from './steps/app-engine/constants';
import {
  STEP_CLOUD_RUN_CONFIGURATIONS,
  STEP_CLOUD_RUN_ROUTES,
  STEP_CLOUD_RUN_SERVICES,
} from './steps/cloud-run/constants';
import { STEP_REDIS_INSTANCES } from './steps/redis/constants';
import { STEP_MEMCACHE_INSTANCES } from './steps/memcache/constants';
import {
  STEP_SPANNER_INSTANCES,
  STEP_SPANNER_INSTANCE_CONFIGS,
  STEP_SPANNER_INSTANCE_DATABASES,
} from './steps/spanner/constants';
import {
  STEP_API_GATEWAY_APIS,
  STEP_API_GATEWAY_API_CONFIGS,
  STEP_API_GATEWAY_GATEWAYS,
} from './steps/api-gateway/constants';
import {
  STEP_PRIVATE_CA_CERTIFICATES,
  STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES,
} from './steps/privateca/constants';
import { getOrganizationSteps } from './getStepStartStates';
import { CLOUD_ASSET_STEPS } from './steps/cloud-asset/constants';
import {
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS,
  STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES,
  STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS,
} from './steps/access-context-manager/constants';

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
      // Unless we want to change what this test does, we need to modify the
      // instanceConfig with configureOrganizationProjects: true, else not
      // all steps will be enabled it'll be disabled

      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
        configureOrganizationProjects: true,
        organizationId: '958457776463',
      },
    });

    const stepStartStates = await getStepStartStates(context);
    const expectedStepStartStates: StepStartStates = {
      [STEP_RESOURCE_MANAGER_ORGANIZATION]: {
        disabled: false,
      },
      [STEP_RESOURCE_MANAGER_FOLDERS]: {
        disabled: false,
      },
      [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
        disabled: false,
      },
      [STEP_RESOURCE_MANAGER_PROJECT]: {
        disabled: false,
      },
      [STEP_API_SERVICES]: {
        disabled: false,
      },
      [CLOUD_ASSET_STEPS.BINDINGS]: {
        disabled: true, // The recordings do not have this service enabled
      },
      [STEP_CLOUD_FUNCTIONS]: {
        disabled: false,
      },
      [STEP_CLOUD_FUNCTIONS_SERVICE_ACCOUNT_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_CLOUD_STORAGE_BUCKETS]: {
        disabled: false,
      },
      [STEP_IAM_CUSTOM_ROLES]: {
        disabled: false,
      },
      [STEP_IAM_MANAGED_ROLES]: {
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
      [STEP_COMPUTE_REGION_DISKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_IMAGE_IMAGE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_COMPUTE_SNAPSHOT_DISK_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_COMPUTE_SNAPSHOTS]: {
        disabled: false,
      },
      [STEP_COMPUTE_IMAGES]: {
        disabled: false,
      },
      [STEP_COMPUTE_NETWORKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_NETWORK_PEERING_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_COMPUTE_ADDRESSES]: {
        disabled: false,
      },
      [STEP_COMPUTE_GLOBAL_ADDRESSES]: {
        disabled: false,
      },
      [STEP_COMPUTE_FIREWALLS]: {
        disabled: false,
      },
      [STEP_COMPUTE_FORWARDING_RULES]: {
        disabled: false,
      },
      [STEP_COMPUTE_GLOBAL_FORWARDING_RULES]: {
        disabled: false,
      },
      [STEP_COMPUTE_REGION_INSTANCE_GROUPS]: {
        disabled: false,
      },
      [STEP_COMPUTE_REGION_BACKEND_SERVICES]: {
        disabled: false,
      },
      [STEP_COMPUTE_SUBNETWORKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_PROJECT]: {
        disabled: false,
      },
      [STEP_COMPUTE_HEALTH_CHECKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_REGION_HEALTH_CHECKS]: {
        disabled: false,
      },
      [STEP_COMPUTE_INSTANCES]: {
        disabled: false,
      },
      [STEP_COMPUTE_INSTANCE_SERVICE_ACCOUNT_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_COMPUTE_INSTANCE_GROUPS]: {
        disabled: false,
      },
      [STEP_COMPUTE_LOADBALANCERS]: {
        disabled: false,
      },
      [STEP_COMPUTE_REGION_LOADBALANCERS]: {
        disabled: false,
      },
      [STEP_COMPUTE_BACKEND_SERVICES]: {
        disabled: false,
      },
      [STEP_COMPUTE_BACKEND_BUCKETS]: {
        disabled: false,
      },
      [STEP_COMPUTE_TARGET_SSL_PROXIES]: {
        disabled: false,
      },
      [STEP_COMPUTE_TARGET_HTTPS_PROXIES]: {
        disabled: false,
      },
      [STEP_COMPUTE_REGION_TARGET_HTTPS_PROXIES]: {
        disabled: false,
      },
      [STEP_COMPUTE_TARGET_HTTP_PROXIES]: {
        disabled: false,
      },
      [STEP_COMPUTE_REGION_TARGET_HTTP_PROXIES]: {
        disabled: false,
      },
      [STEP_COMPUTE_SSL_POLICIES]: {
        disabled: false,
      },
      [STEP_DNS_MANAGED_ZONES]: {
        disabled: false,
      },
      [STEP_CLOUD_KMS_KEY_RINGS]: {
        disabled: false,
      },
      [STEP_CLOUD_KMS_KEYS]: {
        disabled: false,
      },
      [STEP_SQL_ADMIN_INSTANCES]: {
        disabled: false,
      },
      [STEP_CONTAINER_CLUSTERS]: {
        disabled: false,
      },
      [STEP_BIG_QUERY_DATASETS]: {
        disabled: false,
      },
      [STEP_BIG_QUERY_MODELS]: {
        disabled: false,
      },
      [STEP_BIG_QUERY_TABLES]: {
        disabled: false,
      },
      [STEP_LOGGING_METRICS]: {
        disabled: false,
      },
      [STEP_LOGGING_PROJECT_SINKS]: {
        disabled: false,
      },
      [STEP_MONITORING_ALERT_POLICIES]: {
        disabled: false,
      },
      [STEP_BINARY_AUTHORIZATION_POLICY]: {
        disabled: false,
      },
      [STEP_PUBSUB_TOPICS]: {
        disabled: false,
      },
      [STEP_PUBSUB_SUBSCRIPTIONS]: {
        disabled: false,
      },
      [STEP_APP_ENGINE_APPLICATION]: {
        disabled: false,
      },
      [STEP_APP_ENGINE_SERVICES]: {
        disabled: false,
      },
      [STEP_APP_ENGINE_VERSIONS]: {
        disabled: false,
      },
      [STEP_APP_ENGINE_INSTANCES]: {
        disabled: false,
      },
      [STEP_CLOUD_RUN_SERVICES]: {
        disabled: false,
      },
      [STEP_CLOUD_RUN_ROUTES]: {
        disabled: false,
      },
      [STEP_CLOUD_RUN_CONFIGURATIONS]: {
        disabled: false,
      },
      [STEP_REDIS_INSTANCES]: {
        disabled: false,
      },
      [STEP_MEMCACHE_INSTANCES]: {
        disabled: false,
      },
      [STEP_SPANNER_INSTANCE_CONFIGS]: {
        disabled: false,
      },
      [STEP_SPANNER_INSTANCES]: {
        disabled: false,
      },
      [STEP_SPANNER_INSTANCE_DATABASES]: {
        disabled: false,
      },
      [STEP_API_GATEWAY_APIS]: {
        disabled: false,
      },
      [STEP_API_GATEWAY_API_CONFIGS]: {
        disabled: false,
      },
      [STEP_API_GATEWAY_GATEWAYS]: {
        disabled: false,
      },
      [STEP_PRIVATE_CA_CERTIFICATE_AUTHORITIES]: {
        disabled: false,
      },
      [STEP_PRIVATE_CA_CERTIFICATES]: {
        disabled: false,
      },
    };

    expect(stepStartStates).toEqual(expectedStepStartStates);
  });

  test('configureOrganizationProjects: true', async () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
        configureOrganizationProjects: true,
      },
    });

    const stepStartStates = await getStepStartStates(context);

    expect(stepStartStates).toMatchObject({
      [STEP_RESOURCE_MANAGER_ORGANIZATION]: {
        disabled: false,
      },
      [STEP_RESOURCE_MANAGER_FOLDERS]: {
        disabled: false,
      },
      [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
        disabled: false,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
        disabled: false,
      },
    });
  });

  test('configureOrganizationProjects: false or undefined', async () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
      instanceConfig: {
        ...integrationConfig,
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
        configureOrganizationProjects: false,
      },
    });

    const stepStartStates = await getStepStartStates(context);

    expect(stepStartStates).toMatchObject({
      [STEP_RESOURCE_MANAGER_ORGANIZATION]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_FOLDERS]: {
        disabled: true,
      },
      [STEP_RESOURCE_MANAGER_ORG_PROJECT_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_POLICIES]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_ACCESS_LEVELS]: {
        disabled: true,
      },
      [STEP_ACCESS_CONTEXT_MANAGER_SERVICE_PERIMETERS]: {
        disabled: true,
      },
    });
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

    const mockGoogleAuthClient = {
      getClient: mockGetClient,
      getAccessToken: mockGetAccessToken,
    } as unknown as GoogleAuth;

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

    const mockGoogleAuthClient = {
      getClient: mockGetClient,
      getAccessToken: mockGetAccessToken,
    } as unknown as GoogleAuth;

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

describe('#beforeAddEntity', () => {
  test('should add projectId property to entity if projectId is not set', () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: 'my_type',
    };

    expect(
      invocationConfig.beforeAddEntity &&
        invocationConfig.beforeAddEntity(context, mockEntity),
    ).toEqual({
      ...mockEntity,
      projectId: 'j1-gc-integration-dev-v2',
    });
  });

  test('should not override projectId property on entity', () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    const mockEntity: Entity = {
      _key: 'abc',
      _class: 'Resource',
      _type: 'my_type',
      projectId: 'my-project-id',
    };

    expect(
      invocationConfig.beforeAddEntity &&
        invocationConfig.beforeAddEntity(context, mockEntity),
    ).toEqual({
      ...mockEntity,
      projectId: 'my-project-id',
    });
  });
});

describe('#dependencies', () => {
  test('getOrganizationSteps should not depend on non-active steps', () => {
    expect(invocationConfig.integrationSteps).toHaveIsolatedDependencies(
      getOrganizationSteps(),
    );
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveIsolatedDependencies(stepCollection: string[]): R;
    }
  }
}

expect.extend({
  toHaveIsolatedDependencies(
    integrationSteps: Step<any>[],
    stepCollection: string[],
  ) {
    for (const stepId of stepCollection) {
      const stepDependencies = integrationSteps.find(
        (s) => s.id === stepId,
      )?.dependsOn;

      const invalidStepDependencies = stepDependencies?.filter(
        (s) => !stepCollection.includes(s),
      );
      if (invalidStepDependencies?.length) {
        return {
          message: () =>
            `Step '${stepId}' contains invalid step dependencies: [${invalidStepDependencies}]`,
          pass: false,
        };
      }
    }
    return {
      message: () => '',
      pass: true,
    };
  },
});
