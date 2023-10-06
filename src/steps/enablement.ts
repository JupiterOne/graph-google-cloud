import {
  IntegrationLogger,
  StepStartState,
} from '@jupiterone/integration-sdk-core';
import { ServiceUsageName } from '../google-cloud/types';
import { IntegrationConfig } from '../types';
import { collectEnabledServicesForProject } from './service-usage/client';

export interface EnabledServiceData {
  // Enabled APIs in the Google Cloud Project that the Service Account used to authenticate with resides.
  mainProjectEnabledServices?: string[];
  // Enabled APIs in the Google Cloud Project that is being ingested.
  targetProjectEnabledServices?: string[];
  // The intersection of mainProjectEnabledServices and mainProjectEnabledServices
  intersectedEnabledServices?: string[];
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
  logger: IntegrationLogger,
): Promise<EnabledServiceData> {
  const targetProjectId = config.projectId;
  const mainProjectId = config.serviceAccountKeyConfig.project_id;
  const enabledServiceData: EnabledServiceData = {};

  const mainProjectEnabledServices = await getMainProjectEnabledServices(
    config,
    logger,
  );
  enabledServiceData.mainProjectEnabledServices = mainProjectEnabledServices;

  if (!targetProjectId || mainProjectId === targetProjectId) {
    enabledServiceData.intersectedEnabledServices = mainProjectEnabledServices;
    return enabledServiceData;
  }

  const mainProjectEnabledServicesSet = new Set<string>(
    mainProjectEnabledServices,
  );

  const targetProjectEnabledServices = await collectEnabledServicesForProject(
    config,
    targetProjectId,
    logger,
  );
  enabledServiceData.targetProjectEnabledServices =
    targetProjectEnabledServices;

  // Find the intersection between the main project enabled services and the
  // target project enabled services
  const enabledServicesIntersection: string[] = [];

  for (const targetProjectEnabledService of targetProjectEnabledServices) {
    if (mainProjectEnabledServicesSet.has(targetProjectEnabledService)) {
      enabledServicesIntersection.push(targetProjectEnabledService);
    }
  }
  enabledServiceData.intersectedEnabledServices = enabledServicesIntersection;

  return enabledServiceData;
}

export async function getMainProjectEnabledServices(
  config: IntegrationConfig,
  logger: IntegrationLogger,
) {
  return await collectEnabledServicesForProject(
    config,
    config.serviceAccountKeyConfig.project_id,
    logger,
  );
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
