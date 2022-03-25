import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { validateStepStartStates } from '@jupiterone/integration-sdk-runtime/dist/src/execution/validation';
import { IntegrationConfig, invocationConfig } from '.';
import { integrationConfig } from '../test/config';
import {
  getMatchRequestsBy,
  setupGoogleCloudRecording,
  withGoogleCloudRecording,
} from '../test/recording';
import getStepStartStates from './getStepStartStates';
import {
  STEP_IAM_BINDINGS,
  STEP_CREATE_BASIC_ROLES,
  STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS,
  STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS,
} from './steps/cloud-asset/constants';
import { STEP_IAM_CUSTOM_ROLES, STEP_IAM_MANAGED_ROLES } from './steps/iam';

/**
 * NOTE: This test needs to be seperated from the other getStepStartState tests it needs to run with another project context.
 */

describe('createStartStatesBasedOnServiceAccountProject', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupGoogleCloudRecording({
      directory: __dirname,
      name: 'getStepStartStatesExtraTests',
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test.skip('When the config.projectId is different from the config.serviceAccountKeyConfig.project_id, the Service Account Project will be used in determining `google_iam_binding` and `google_iam_role` steps.', async () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: {
        projectId: 'j1-gc-integration-dev-nested', // Project that doesn't have Cloud Asset API enabled and is in the same org as j1-gc-integration-dev-v3
        // Temporary tweak to make this test pass since its recording has been updated from the new organization/v3
        serviceAccountKeyFile: integrationConfig.serviceAccountKeyFile.replace(
          'j1-gc-integration-dev-v2',
          'j1-gc-integration-dev-v3',
        ),
        serviceAccountKeyConfig: {
          ...integrationConfig.serviceAccountKeyConfig,
          project_id: 'j1-gc-integration-dev-v3',
        },
      },
    });

    const stepStartStates = await getStepStartStates(context);

    expect(stepStartStates).toMatchObject({
      [STEP_IAM_BINDINGS]: {
        disabled: false,
      },
      [STEP_CREATE_BASIC_ROLES]: {
        disabled: false,
      },
      [STEP_CREATE_BINDING_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_CREATE_API_SERVICE_ANY_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_IAM_CUSTOM_ROLES]: {
        disabled: false,
      },
      [STEP_IAM_MANAGED_ROLES]: {
        disabled: false,
      },
    });
  });
});

test.skip('should successfully validate stepStartStates', async () => {
  await withGoogleCloudRecording(
    {
      directory: __dirname,
      name: 'validateStepStartStates',
      options: {
        matchRequestsBy: getMatchRequestsBy(integrationConfig),
      },
    },
    async () => {
      expect(invocationConfig.getStepStartStates).not.toBeUndefined();
      const stepStartStates = await invocationConfig.getStepStartStates?.(
        createMockExecutionContext({
          instanceConfig: integrationConfig,
        }),
      );
      expect(() =>
        validateStepStartStates(
          invocationConfig.integrationSteps,
          stepStartStates!,
        ),
      ).not.toThrow();
    },
  );
});
