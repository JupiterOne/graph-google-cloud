import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { validateStepStartStates } from '@jupiterone/integration-sdk-runtime/dist/src/execution/validation';
import { invocationConfig } from '.';
import { integrationConfig } from '../test/config';
import {
  getMatchRequestsBy,
  withGoogleCloudRecording,
} from '../test/recording';
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
  test('When the config.projectId is different from the config.serviceAccountKeyConfig.project_id, the Service Account Project will be used in determining `google_iam_binding` and `google_iam_role` steps.', async () => {
    await withGoogleCloudRecording(
      {
        directory: __dirname,
        name: 'getStepStartStatesExtraTests',
        options: {
          matchRequestsBy: getMatchRequestsBy(integrationConfig),
        },
      },
      async () => {
        const stepStartStates = await invocationConfig.getStepStartStates?.(
          createMockExecutionContext({
            instanceConfig: integrationConfig,
          }),
        );
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
      },
    );
  });
});

test('should successfully validate stepStartStates', async () => {
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
