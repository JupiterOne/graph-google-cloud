import {
  IntegrationInstanceConfig,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

export type IntegrationStepContext = IntegrationStepExecutionContext<
  IntegrationConfig
>;

export interface IntegrationConfig extends IntegrationInstanceConfig {
  privateKey: string;
  projectId: string;
  clientEmail: string;
}
