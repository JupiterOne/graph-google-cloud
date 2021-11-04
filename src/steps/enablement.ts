import { StepStartState } from '@jupiterone/integration-sdk-core';
import { ServiceUsageName } from '../google-cloud/types';
import { IntegrationConfig } from '../types';
import { collectEnabledServicesForProject } from './service-usage/client';

/**
 * An integration can provide a service account key file for a service account
 * that exists in one project, but has permissions to ingest data from a
 * _different_ project. This function determines which unique projects should
 * be considered when calculating step enablement.
 *
 * The first index in the array is guaranteed to be the "main" project
 */
export function getUniqueIntegrationConfigProjectsForStepEnablement(
  config: IntegrationConfig,
): string[] {
  const uniqueProjectIds: string[] = [
    // Main project ID
    config.serviceAccountKeyConfig.project_id,
  ];

  if (
    config.projectId &&
    config.projectId !== config.serviceAccountKeyConfig.project_id
  ) {
    uniqueProjectIds.push(config.projectId);
  }

  return uniqueProjectIds;
}

/**
 * Determines the overall services that are enabled. The result information is
 * used to disable specific steps.
 *
 * If a "main" and "target" project are specified in the configuration, we
 * consider both projects and calculate the intersection. The "main" project
 * contains the baseline services that can be used across any project that the
 * service account is used in. If a service is disabled in the "main" project,
 * it cannot be used even if the "target" project has that API enabled.
 * Additionally, if the "main" project has an API enabled, but the "target"
 * project does not have that API enabled, the integration can _technically_
 * hit the APIs, but it would be a waste of effort because there would be no
 * resources provisioned in the "target" project for the provided service. We
 * can speed up the integration execution by simply disabling steps if the
 * "target" project has the APIs disabled, but the "main" project has those APIs
 * enabled.
 */
export async function getEnabledServiceNames(
  config: IntegrationConfig,
  onlyMainProjectEnabledService: boolean = false,
): Promise<string[]> {
  const [mainProjectId, targetProjectId] =
    getUniqueIntegrationConfigProjectsForStepEnablement(config);

  const mainProjectEnabledServices = await collectEnabledServicesForProject(
    config,
    mainProjectId,
  );

  if (!targetProjectId || onlyMainProjectEnabledService) {
    return mainProjectEnabledServices;
  }

  const mainProjectEnabledServicesSet = new Set<string>(
    mainProjectEnabledServices,
  );

  const targetProjectEnabledServices = await collectEnabledServicesForProject(
    config,
    targetProjectId,
  );

  // Find the intersection between the main project enabled services and the
  // target project enabled services
  const enabledServicesIntersection: string[] = [];

  for (const targetProjectEnabledService of targetProjectEnabledServices) {
    if (mainProjectEnabledServicesSet.has(targetProjectEnabledService)) {
      enabledServicesIntersection.push(targetProjectEnabledService);
    }
  }

  return enabledServicesIntersection;
}

export function createStepStartState(
  enabledServiceNames: string[],
  primaryServiceName: ServiceUsageName,
  ...additionalServiceNames: ServiceUsageName[]
): StepStartState {
  const allServicesToEnableStep: ServiceUsageName[] = [
    primaryServiceName,
    ...additionalServiceNames,
  ];

  let disabled = true;

  for (const serviceName of allServicesToEnableStep) {
    if (enabledServiceNames.includes(serviceName)) {
      disabled = false;
      break;
    }
  }

  return { disabled };
}

export function createStepStartStateWhereAllServicesMustBeEnabled(
  enabledServiceNames: string[],
  primaryServiceName: ServiceUsageName,
  ...additionalServiceNames: ServiceUsageName[]
): StepStartState {
  const allServicesToEnableStep: ServiceUsageName[] = [
    primaryServiceName,
    ...additionalServiceNames,
  ];

  for (const serviceName of allServicesToEnableStep) {
    if (!enabledServiceNames.includes(serviceName)) {
      return { disabled: true };
    }
  }

  return { disabled: false };
}
