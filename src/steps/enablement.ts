import { StepStartState } from '@jupiterone/integration-sdk-core';
import { ServiceUsageName } from '../google-cloud/types';
import { IntegrationConfig } from '../types';
import { collectEnabledServicesForProject } from './service-usage/client';

const disabledServiceToStepMap: {
  [key in ServiceUsageName]?: Set<string>;
} = {};

export function getDisabledServiceToStepMap() {
  return disabledServiceToStepMap;
}

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
): Promise<EnabledServiceData> {
  const targetProjectId = config.projectId;
  const mainProjectId = config.serviceAccountKeyConfig.project_id;
  const enabledServiceData: EnabledServiceData = {};

  const mainProjectEnabledServices = await getMainProjectEnabledServices(
    config,
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

export async function getMainProjectEnabledServices(config: IntegrationConfig) {
  return await collectEnabledServicesForProject(
    config,
    config.serviceAccountKeyConfig.project_id,
  );
}

export function createStepStartState(
  {
    stepId,
    enabledServiceNames, 
    primaryServiceName,
    additionalServiceNames
  }:
  {
    stepId: string
    enabledServiceNames: string[];
    primaryServiceName: ServiceUsageName;
    additionalServiceNames?: ServiceUsageName[];
  }
): StepStartState {
  const allServicesToEnableStep: ServiceUsageName[] = [
    primaryServiceName,
    ...(additionalServiceNames || []),
  ];

  let disabled = true;
  const disabledServices: ServiceUsageName[] = [];

  for (const serviceName of allServicesToEnableStep) {
    if (enabledServiceNames.includes(serviceName)) {
      disabled = false;
    } else {
      disabledServices.push(serviceName);
    }
  }

  buildDisabledServicesToStepMap(stepId, disabledServices);

  return { disabled };
}

export function createStepStartStateWhereAllServicesMustBeEnabled(
  {
    stepId,
    enabledServiceNames, 
    primaryServiceName,
    additionalServiceNames
  }:
  {
    stepId: string
    enabledServiceNames: string[];
    primaryServiceName: ServiceUsageName;
    additionalServiceNames?: ServiceUsageName[];
  }
): StepStartState {
  const allServicesToEnableStep: ServiceUsageName[] = [
    primaryServiceName,
    ...(additionalServiceNames || []),
  ];

  let disabled = false;
  const disabledServices: ServiceUsageName[] = [];

  for (const serviceName of allServicesToEnableStep) {
    if (!enabledServiceNames.includes(serviceName)) {
      disabled = true;
      disabledServices.push(serviceName);
    }
  }

  buildDisabledServicesToStepMap(stepId, disabledServices);

  return { disabled };
}

function buildDisabledServicesToStepMap(stepId: string, disabledServices: ServiceUsageName[]): void {
  disabledServices.forEach((serviceName) => {
    if (!disabledServiceToStepMap[serviceName]) {
      disabledServiceToStepMap[serviceName] = new Set<string>();
    }
    disabledServiceToStepMap[serviceName]!.add(stepId)
  });
}
