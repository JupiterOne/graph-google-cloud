import {
  GoogleCloudIntegrationStep,
  IntegrationStepContext,
} from '../../types';
import { publishUnsupportedConfigEvent } from '../../utils/events';
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
    logger,
  } = context;

  const client = new MonitoringClient({ config }, logger);

  try {
    await client.iterateAlertPolicies(async (alertPolicy) => {
      await jobState.addEntity(
        createAlertPolicyEntity(alertPolicy, client.projectId),
      );
    });
  } catch (err) {
    if (err.message?.match && err.message.match(/is not a workspace/i)) {
      publishUnsupportedConfigEvent({
        logger,
        resource: 'Alert Policies',
        reason: `${client.projectId} project is not a workspace`,
      });
    } else {
      throw err;
    }
  }
}

export const monitoringSteps: GoogleCloudIntegrationStep[] = [
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
    permissions: ['monitoring.alertPolicies.list'],
    apis: ['monitoring.googleapis.com'],
  },
];
