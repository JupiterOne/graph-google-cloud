import {
  IntegrationInstanceConfig,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { ParsedServiceAccountKeyFile } from './utils/parseServiceAccountKeyFile';

export type IntegrationStepContext =
  IntegrationStepExecutionContext<IntegrationConfig>;

export interface SerializedIntegrationConfig extends IntegrationInstanceConfig {
  serviceAccountKeyFile: string;
}

export interface IntegrationConfig extends SerializedIntegrationConfig {
  serviceAccountKeyConfig: ParsedServiceAccountKeyFile;
}
