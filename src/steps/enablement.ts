import { StepStartState } from '@jupiterone/integration-sdk-core';
import { ServiceUsageName } from '../google-cloud/types';
import { IntegrationConfig } from '../types';
import { collectEnabledServicesForProject } from './service-usage/client';

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
): Promise<string[]> {
  const targetProjectId = config.projectId;

  const mainProjectEnabledServices = await getMainProjectEnabledServices(
    config,
  );

  if (!targetProjectId) {
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

// Cahceing this value so we don't have to fetch it twice
let mainProjectEnabledServices: string[] | undefined = undefined;
export function clearMainProjectEnabledServicesCache() {
  mainProjectEnabledServices = undefined;
}

export async function getMainProjectEnabledServices(config: IntegrationConfig) {
  mainProjectEnabledServices = mainProjectEnabledServices
    ? mainProjectEnabledServices
    : await collectEnabledServicesForProject(
        config,
        config.serviceAccountKeyConfig.project_id,
      );
  return mainProjectEnabledServices;
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
