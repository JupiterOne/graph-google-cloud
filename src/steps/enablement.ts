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
 * project does not have that API enabled, the integration can hit the APIs.
 */
export async function getEnabledServiceNames(
  config: IntegrationConfig,
): Promise<string[]> {
  return collectEnabledServicesForProject(
    config,
    config.serviceAccountKeyConfig.project_id,
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
