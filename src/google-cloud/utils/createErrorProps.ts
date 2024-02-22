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

function redactBearerTokens(err: GaxiosError | Error) {
  const tokenRegex = /Bearer\s[^\s]+/i;

  for (const key in err) {
    if (typeof err[key] === 'string') {
      err[key] = err[key].replace(tokenRegex, 'Bearer [REDACTED]');
    } else if (typeof err[key] === 'object' && err[key] !== null) {
      redactBearerTokens(err[key]); // Recursive call for nested objects
    }
  }

  return err;
}

export function createErrorProps(error: Error | GaxiosError): J1ApiErrorProps {
  if (isGaxiosError(error) && error.response) {
    return {
      cause: redactBearerTokens(error),
      endpoint: error.response?.config?.url || UNKNOWN_VALUE,
      status: error.response?.status,
      statusText: error.message,
    };
  } else {
    return {
      // If it isn't GaxiosError, not sure what the args are so just take the error and move on
      cause: redactBearerTokens(error),
      endpoint: UNKNOWN_VALUE,
      status: UNKNOWN_VALUE,
      statusText: error.message || UNKNOWN_VALUE,
    };
  }
}
