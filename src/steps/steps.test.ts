import {
  IntegrationError,
  IntegrationProviderAuthorizationError,
  IntegrationStep,
} from '@jupiterone/integration-sdk-core';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../types';
import { wrapStepExecutionHandlers } from './steps';
const serviceApiDisabledErrorResponse = require('./__test__/service-api-disabled-error-response.json');

describe('#wrapStepExecutionHandlers', () => {
  test('should return original IntegrationProviderAuthorizationError details', async () => {
    const authorizationError =
      createMockIntegrationProviderAuthorizationError();

    const steps = wrapStepExecutionHandlers([
      createMockIntegrationStep({
        executionHandler: jest.fn().mockRejectedValueOnce(authorizationError),
      }),
    ]);

    const stepExecutionContext =
      createMockStepExecutionContext<IntegrationConfig>();

    await expect(
      steps[0].executionHandler(stepExecutionContext),
    ).rejects.toThrow(authorizationError);
  });

  test('should return original error details if not IntegrationProviderAuthorizationError and original error is not due to a service API being disabled', async () => {
    const integrationError = new IntegrationError({
      code: 'EXPECTED_ERROR',
      message: 'expected error',
    });

    const steps = wrapStepExecutionHandlers([
      createMockIntegrationStep({
        executionHandler: jest.fn().mockRejectedValueOnce(integrationError),
      }),
    ]);

    const stepExecutionContext =
      createMockStepExecutionContext<IntegrationConfig>();

    await expect(
      steps[0].executionHandler(stepExecutionContext),
    ).rejects.toThrow(integrationError);
  });

  test('should handle raw GCP service API disabled error', async () => {
    expect.assertions(1);

    const steps = wrapStepExecutionHandlers([
      createMockIntegrationStep({
        executionHandler: jest
          .fn()
          .mockRejectedValueOnce(serviceApiDisabledErrorResponse),
      }),
    ]);

    const stepExecutionContext =
      createMockStepExecutionContext<IntegrationConfig>();

    try {
      await steps[0].executionHandler(stepExecutionContext);
    } catch (err) {
      expect(err instanceof IntegrationProviderAuthorizationError).toEqual(
        true,
      );
    }
  });
});

function createMockIntegrationStep(
  partialStep?: Partial<IntegrationStep<IntegrationConfig>>,
): IntegrationStep<IntegrationConfig> {
  return {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [],
    relationships: [],
    executionHandler: jest.fn(),
    ...partialStep,
  };
}

function createMockIntegrationProviderAuthorizationError() {
  const cause = new Error('original error');
  return new IntegrationProviderAuthorizationError({
    cause,
    endpoint: 'https://api.jupiterone.io',
    status: 403,
    statusText: 'status text',
  });
}
