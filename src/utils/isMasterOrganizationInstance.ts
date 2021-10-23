import { SerializedIntegrationConfig } from '../types';

/**
 * If we have configureOrganizationProjects, we only want to ingest some things once of all instances.
 * These are usually handled in the "Master Instance", which is the instance with
 * `configureOrganizationProjects` checked.
 */
export function isMasterOrganizationInstance(
  config: SerializedIntegrationConfig,
) {
  return config.configureOrganizationProjects && !!config.organizationId;
}
