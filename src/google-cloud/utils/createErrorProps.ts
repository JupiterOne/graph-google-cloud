import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import { GaxiosError } from 'gaxios';
import { GetConstructorArgs } from './typeFunctions';

const UNKNOWN_VALUE = 'UNKNOWN';

type J1ApiErrorProps = GetConstructorArgs<
  typeof IntegrationProviderAPIError
>[0];

const isGaxiosError = (error: Error | GaxiosError): error is GaxiosError => {
  return error.constructor.name === 'GaxiosError';
};

export function createErrorProps(error: Error | GaxiosError): J1ApiErrorProps {
  if (isGaxiosError(error) && error.response) {
    return {
      cause: error,
      endpoint: error.response?.config?.url || UNKNOWN_VALUE,
      status: error.response?.status,
      statusText: error.message,
    };
  } else {
    return {
      // If it isn't GaxiosError, not sure what the args are so just take the error and move on
      cause: error,
      endpoint: UNKNOWN_VALUE,
      status: UNKNOWN_VALUE,
      statusText: error.message || UNKNOWN_VALUE,
    };
  }
}
