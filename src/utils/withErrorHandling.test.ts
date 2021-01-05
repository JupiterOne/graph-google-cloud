import {
  IntegrationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { IntegrationStepContext } from '../types';
import { withErrorHandling } from './withErrorHandling';

test('should throw an IntegrationValidationError when a billing message is error is thrown', async () => {
  const executionHandler = jest
    .fn()
    .mockRejectedValue(
      new Error(
        'This API method requires billing to be enabled. Please enable billing on project #545240943112 by visiting https://console.developers.google.com/billing/enable?project=545240943112 then retry. If you enabled billing for this project recently, wait a few minutes for the action to propagate to our systems and retry.',
      ),
    );
  const handledThrowerFunction = withErrorHandling(executionHandler);
  const fakeContext = {} as IntegrationStepContext;
  try {
    await handledThrowerFunction(fakeContext);
  } catch (error) {
    expect(error).toBeInstanceOf(IntegrationValidationError);
  }
});

test('should throw an IntegrationError on all other unhandled errors', async () => {
  const executionHandler = jest
    .fn()
    .mockRejectedValue(new Error('Something esploded'));
  const handledThrowerFunction = withErrorHandling(executionHandler);
  const fakeContext = {} as IntegrationStepContext;
  try {
    await handledThrowerFunction(fakeContext);
  } catch (error) {
    expect(error).toBeInstanceOf(IntegrationError);
  }
});
