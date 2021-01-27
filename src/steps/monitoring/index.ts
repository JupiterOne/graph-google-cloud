import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, IntegrationStepContext } from '../../types';
import { MonitoringClient } from './client';
import {
  MONITORING_ALERT_POLICY_CLASS,
  MONITORING_ALERT_POLICY_TYPE,
  STEP_MONITORING_ALERT_POLICIES,
} from './constants';
import { createAlertPolicyEntity } from './converters';

export async function fetchAlertPolicies(
  context: IntegrationStepContext,
): Promise<void> {
  const {
    jobState,
    instance: { config },
  } = context;

  const client = new MonitoringClient({ config });

  await client.iterateAlertPolicies(async (alertPolicy) => {
    await jobState.addEntity(createAlertPolicyEntity(alertPolicy));
  });
}

export const monitoringSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: STEP_MONITORING_ALERT_POLICIES,
    name: 'Monitoring Alert Policies',
    entities: [
      {
        resourceName: 'Monitoring Alert Policy',
        _type: MONITORING_ALERT_POLICY_TYPE,
        _class: MONITORING_ALERT_POLICY_CLASS,
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAlertPolicies,
  },
];
