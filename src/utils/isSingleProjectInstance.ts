import { SerializedIntegrationConfig } from '../types';

/**
 * We only want to ingest some things if the integration instance only relates to a single Google Cloud project.
 */
export function isSingleProjectInstance(
  config: SerializedIntegrationConfig,
): boolean {
  return !config.configureOrganizationProjects && !config.organizationId;
}
