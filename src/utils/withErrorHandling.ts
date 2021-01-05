import {
  IntegrationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { IntegrationStepContext } from '../types';

/**
 * Handles errors for step handler functions
 */
export function withErrorHandling(
  fn: (context: IntegrationStepContext) => Promise<void>,
) {
  return async (context: IntegrationStepContext) => {
    try {
      await fn(context);
    } catch (error) {
      if (error.message && error.message.match(/requires\sbilling/)) {
        throw new IntegrationValidationError(error.message); // send billing config error message to the job log
      } else {
        throw new IntegrationError({
          message: error.message,
          code: error.code,
          fatal: false,
        });
      }
    }
  };
}
