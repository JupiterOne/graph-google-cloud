import {
  IntegrationInstanceConfig,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';
import { ParsedServiceAccountKeyFile } from './utils/parseServiceAccountKeyFile';

export type IntegrationStepContext =
  IntegrationStepExecutionContext<IntegrationConfig>;

export interface SerializedIntegrationConfig extends IntegrationInstanceConfig {
  serviceAccountKeyFile: string;
  configureOrganizationProjects?: boolean;
  organizationId?: string;
  /**
   * The project ID that this integration should target for ingestion. This
   * defaults to the project ID specified inside of the `serviceAccountKeyFile`.
   *
   * The use case is for when the `configureOrganizationProjects` is enabled and
   * the JupiterOne backend auto-configures all projects under an organization.
   * The credentials will then be shared amongst the individual integration
   * instances, and the integration needs a way to denote which project to
   * target.
   */
  projectId?: string;
  configureOrganizationAccounts?: boolean;
}

export interface IntegrationConfig extends SerializedIntegrationConfig {
  serviceAccountKeyConfig: ParsedServiceAccountKeyFile;
}
