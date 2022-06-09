import { IntegrationConfig, SerializedIntegrationConfig } from '../types';
import { parseServiceAccountKeyFile } from './parseServiceAccountKeyFile';

/**
 * The incoming Google Cloud config may include a `serviceAccountKeyFile` property
 * that we need to deserialize. We will override the value of the
 * `IntegrationExecutionContext` `config` with the return value of this function,
 * so that the deserialized config can be used throughout all of the steps.
 */
export function deserializeIntegrationConfig(
  serializedIntegrationConfig: SerializedIntegrationConfig,
): IntegrationConfig {
  if (!serializedIntegrationConfig.serviceAccountKeyFile) {
    return serializedIntegrationConfig;
  }

  const parsedServiceAccountKeyFile = parseServiceAccountKeyFile(
    serializedIntegrationConfig.serviceAccountKeyFile,
  );

  return {
    ...serializedIntegrationConfig,
    serviceAccountKeyConfig: parsedServiceAccountKeyFile,
  };
}
