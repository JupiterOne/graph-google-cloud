import { GaxiosError } from 'gaxios';

export function createErrorProps(error: any) {
  return error instanceof GaxiosError
    ? {
        cause: error,
        endpoint: error.response?.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
      }
    : {
        // if it ain't GaxiosError, not sure what the args may be so just guess
        cause: error,
        endpoint: error.endpoint,
        status: error.status,
        statusText: error.statusText,
      };
}
